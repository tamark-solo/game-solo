import {mkdir,readFile,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {createHash} from 'node:crypto';
for(const name of ['wang-lin-costume-review-v2','wang-lin-hoa-than-review-v1','wang-lin-hoa-than-review-v2']){const folder=resolve('docs/design/characters',name),target=resolve('client/public/assets',name);const manifest=JSON.parse(await readFile(resolve(folder,'assets.json'),'utf8'));await mkdir(target,{recursive:true});
for(const asset of manifest.assets){const file=asset.web??asset.file;if(!/^[a-z0-9-]+\.(webp|png)$/.test(file))throw new Error('Invalid study asset filename');const bytes=await readFile(resolve(folder,file));if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('Character study hash mismatch: '+file);await writeFile(resolve(target,file),bytes);}}
console.log('Prepared character art review assets; runtime avatar unchanged.');

await import('./sync-hoa-than-aura-concepts.mjs');
