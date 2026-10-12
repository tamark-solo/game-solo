import {readFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),folder=resolve(root,'docs/design/ui/van-ngoc-co-dong-v1'),target=resolve(root,'client/public/assets/van-ngoc-co-dong-v1');
const manifest=JSON.parse(await readFile(resolve(folder,'assets.json'),'utf8')),aperture=JSON.parse(await readFile(resolve(folder,'frame-aperture.json'),'utf8'));
if(manifest.assets.find(a=>a.id==='window').sha256!==aperture.sourceSha256)throw new Error('Frame and backing slices do not match.');
await mkdir(target,{recursive:true});
for(const asset of [...manifest.assets,...aperture.tiles]){const source=resolve(folder,asset.file),buffer=await readFile(source);if(createHash('sha256').update(buffer).digest('hex')!==asset.sha256)throw new Error('Review asset hash mismatch: '+asset.file);await copyFile(source,resolve(target,asset.file));}
const concept=resolve(root,'docs/design/world/hang-nhac-van-ngoc-concept-v1'),meta=JSON.parse(await readFile(resolve(concept,'concept.json'),'utf8')),source=resolve(concept,meta.web.file);
if(createHash('sha256').update(await readFile(source)).digest('hex')!==meta.web.sha256)throw new Error('Map concept hash changed.');
await copyFile(source,resolve(target,'concept.webp'));
console.log('Prepared isolated Cổ đồng UI review assets.');
