// Normal builds copy selected authored products; they never regenerate artwork.
import { readFile, copyFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const source=resolve('docs/design/characters/quest-motion-v1'),target=resolve('client/public/assets/quest-motion');
const catalog=JSON.parse(await readFile(join(source,'clips.json'),'utf8'));await mkdir(target,{recursive:true});
for(const clip of Object.values(catalog.clips)){const name=clip.atlasUrl.split('/').at(-1).split('?')[0];await copyFile(join(source,'atlases',name),join(target,name));}
await copyFile(join(source,'clips.json'),join(target,'clips.json'));
await copyFile(join(source,'index.html'),join(target,'index.html'));
console.log(`Copied ${Object.keys(catalog.clips).length} quest animation atlases.`);
