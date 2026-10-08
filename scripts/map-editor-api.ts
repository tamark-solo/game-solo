import { mkdir, readFile, readdir, writeFile, rename, stat } from 'node:fs/promises';
import { resolve, dirname, sep, relative } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { parseProject,exportEditorLevel } from '../shared/map-editor.ts';

export function mapEditorApi():Plugin {
  const workspace=resolve('.'),folder=resolve(process.env.MAP_EDITOR_STORAGE??'docs/data/authored-maps');
  if(!folder.startsWith(workspace+sep))throw new Error('Map storage must stay in workspace.');
  const handle=async(req:IncomingMessage,res:ServerResponse,next:()=>void)=>{
    const path=(req.url??'').split('?')[0];if(!path.startsWith('/api/map-editor/projects'))return next();
    const send=(status:number,value:unknown)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
    try{
      await mkdir(folder,{recursive:true});
      if(path==='/api/map-editor/projects'&&req.method==='GET'){
        const results=[];for(const file of await readdir(folder)){if(!/^[a-zA-Z0-9_-]+\.json$/.test(file))continue;try{const p=parseProject(JSON.parse(await readFile(resolve(folder,file),'utf8')));results.push({id:p.id,name:p.name,updatedAt:(await stat(resolve(folder,file))).mtime.toISOString()});}catch{/* Other invalid files stay untouched. */}}
        return send(200,{projects:results.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))});
      }
      const id=path.slice('/api/map-editor/projects/'.length);if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(id))return send(400,{error:'ID không hợp lệ.'});
      const file=resolve(folder,`${id}.json`);if(dirname(file)!==folder)return send(400,{error:'Đường dẫn không hợp lệ.'});
      if(req.method==='GET')return send(200,parseProject(JSON.parse(await readFile(file,'utf8'))));
      if(req.method==='POST'){
        let size=0;const chunks:Buffer[]=[];for await(const chunk of req){const b=Buffer.from(chunk);size+=b.length;if(size>20*1024*1024)return send(413,{error:'Dự án vượt20 MB. Tách thành các dự án nhỏ hơn.'});chunks.push(b);}
        const project=parseProject(JSON.parse(Buffer.concat(chunks).toString('utf8')));if(project.id!==id)return send(400,{error:'ID dự án không khớp.'});
        if(project.levels.some(l=>/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(l.id)))return send(400,{error:'ID level trùng tên hệ thống Windows.'});
        const levelFolder=resolve(folder,`${id}.levels`);await mkdir(levelFolder,{recursive:true});
        for(const l of project.levels){const dest=resolve(levelFolder,`${l.id}.json`);if(dirname(dest)!==levelFolder)throw new Error('Invalid level path.');const temporary=resolve(levelFolder,`${l.id}-${crypto.randomUUID()}.tmp`);await writeFile(temporary,JSON.stringify(exportEditorLevel(project,l),null,2)+'\n','utf8');await rename(temporary,dest);}
        const indexTmp=resolve(levelFolder,`index-${crypto.randomUUID()}.tmp`);await writeFile(indexTmp,JSON.stringify({projectId:id,levels:project.levels.map(l=>({id:l.id,name:l.name,file:`${l.id}.json`}))},null,2)+'\n','utf8');await rename(indexTmp,resolve(levelFolder,'index.json'));
        const tmp=resolve(folder,`${id}-${crypto.randomUUID()}.tmp`);await writeFile(tmp,JSON.stringify(project,null,2)+'\n','utf8');await rename(tmp,file);
        return send(200,{saved:true,path:relative(workspace,file).split(sep).join('/'),levelFolder:relative(workspace,levelFolder).split(sep).join('/')});
      }
      send(405,{error:'Phương thức không hỗ trợ.'});
    }catch(error){send((error as NodeJS.ErrnoException).code==='ENOENT'?404:400,{error:String(error)});}
  };
  return {name:'game-solo-map-editor-storage',configureServer(server){server.middlewares.use((req,res,next)=>{void handle(req,res,next);});},configurePreviewServer(server){server.middlewares.use((req,res,next)=>{void handle(req,res,next);});}};
}
