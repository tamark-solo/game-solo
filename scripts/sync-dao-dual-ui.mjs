import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),folder=resolve(root,'docs/design/ui/dao-dual-theme-v1'),target=resolve(root,'client/public/assets/dao-dual-theme-v1');
const m=JSON.parse(await readFile(resolve(folder,'assets.json'),'utf8'));
for(const asset of [...m.assets,...m.masks]){const source=resolve(folder,asset.file),bytes=await readFile(source);if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('Dual UI asset hash mismatch: '+asset.file);await mkdir(dirname(resolve(target,asset.file)),{recursive:true});await copyFile(source,resolve(target,asset.file));}
await writeFile(resolve(target,'layout.json'),JSON.stringify(m.layout)+'\n');
const map=resolve(root,'docs/design/world/hang-nhac-van-ngoc-concept-v1'),info=JSON.parse(await readFile(resolve(map,'concept.json'),'utf8')),source=resolve(map,info.web.file),image=await readFile(source);
if(createHash('sha256').update(image).digest('hex')!==info.web.sha256)throw new Error('Concept hash mismatch.');await copyFile(source,resolve(target,'concept.webp'));
console.log('Prepared Tu Đạo / Đọa Ma review assets.');
