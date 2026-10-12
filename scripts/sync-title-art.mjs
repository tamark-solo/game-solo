import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const source=resolve('docs/design/ui/title-tien-mon-v1'),target=resolve('client/public/assets/title-tien-mon-v1');
const manifest=JSON.parse(await readFile(join(source,'assets.json'),'utf8'));
await mkdir(target,{recursive:true});
for(const asset of manifest.assets){
  if(!/^[a-z0-9-]+\.webp$/.test(asset.file))throw new Error('Invalid title asset path.');
  const bytes=await readFile(join(source,asset.file));if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('Title art hash mismatch.');
  await writeFile(join(target,asset.file),bytes);
}
console.log('Copied independent title background; no gameplay map changes.');
