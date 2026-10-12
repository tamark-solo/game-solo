import {readFile,realpath} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import type {ContentCatalogReader} from '../core/content-ports';
import {validateContentCatalog,type CatalogSnapshot,type CatalogIssue} from '../../../shared/content/catalog';

// Filesystem adapter for the authoring registry. No profile/DB/map writes or gameplay commands.
export class FileContentCatalog implements ContentCatalogReader {
  constructor(private workspaceRoot:string,private catalogPath=resolve(workspaceRoot,'docs/design/systems/content-registry-v1/catalog.json')){}
  async read():Promise<CatalogSnapshot>{
    const checkedAt=Date.now(),source=relative(this.workspaceRoot,this.catalogPath).replaceAll('\\','/');
    let hash:string|null=null;
    try{
      const data=await readFile(this.catalogPath);if(data.byteLength>2_000_000)throw new Error('Catalog exceeds 2 MB');
      hash=createHash('sha256').update(data).digest('hex');
      const result=validateContentCatalog(JSON.parse(data.toString('utf8')));
      if(!result.catalog)return {...result,hash,checkedAt,source};
      const catalog=result.catalog,issues:CatalogIssue[]=[...result.issues],root=await realpath(this.workspaceRoot),sources=new Map<string,string>();
      for(const record of catalog.records){
        const key=`${record.domain}:${record.id}`;
        try{
          let text=sources.get(record.source.path);
          if(text===undefined){
            const path=await realpath(resolve(root,record.source.path)),rel=relative(root,path);
            if(rel==='..'||rel.startsWith('..\\')||rel.startsWith('../')||isAbsolute(rel))throw new Error('Source outside workspace');
            const data=await readFile(path);if(data.byteLength>2_000_000)throw new Error('Source exceeds 2 MB');text=data.toString('utf8');sources.set(record.source.path,text);
          }
          if(record.source.collection){const values=JSON.parse(text)[record.source.collection];if(!Array.isArray(values)||!values.some(v=>v&&typeof v==='object'&&v.id===record.source.recordId))throw new Error('Collection record not found');}
          if(record.source.symbol&&!new RegExp('export\\s+(?:const|function)\\s+'+record.source.symbol.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b').test(text))throw new Error('Source symbol not found');
        }catch{
          issues.push({severity:'error',code:'source_pointer',path:record.source.path,recordKey:key,message:'Nguồn thiếu, vượt phạm vi hoặc selector không còn hợp lệ.'});
        }
      }
      return {catalog:issues.some(v=>v.severity==='error')?undefined:catalog,issues,hash,checkedAt,source};
    }catch{return {issues:[{severity:'error',code:'catalog_read',path:'$',message:'Chưa đọc được catalog JSON hợp lệ (tối đa 2 MB).'}],hash,checkedAt,source};}
  }
}
