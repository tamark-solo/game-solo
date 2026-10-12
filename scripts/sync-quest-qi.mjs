import { readFile,copyFile,mkdir } from 'node:fs/promises';import {resolve,join} from 'node:path';
const source=resolve('docs/design/vfx/quest-qi-v1'),target=resolve('client/public/assets/quest-qi');await mkdir(target,{recursive:true});
const catalog=JSON.parse(await readFile(join(source,'clips.json'),'utf8'));
for(const id of Object.keys(catalog.clips))await copyFile(join(source,'atlases',id+'.webp'),join(target,id+'.webp'));
await copyFile(join(source,'clips.json'),join(target,'clips.json'));console.log('Copied quest qi formation, flow, recovery and palm FX.');
