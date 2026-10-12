import {fileURLToPath} from 'node:url';
import {FileContentCatalog} from './persistence/content-catalog-file';
const result=await new FileContentCatalog(fileURLToPath(new URL('../../',import.meta.url)),process.env.GAME_CONTENT_CATALOG_PATH).read();
const errors=result.issues.filter(v=>v.severity==='error');
console.log(JSON.stringify({valid:!!result.catalog,records:result.catalog?.records.length??0,hash:result.hash,errors,warnings:result.issues.filter(v=>v.severity==='warning').length,runtimeConsumable:false},null,2));
if(errors.length)process.exitCode=1;
