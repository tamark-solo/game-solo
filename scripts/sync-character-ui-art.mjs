import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
const source=resolve('docs/design/ui/character-van-ngoc-v2'),target=resolve('client/public/assets/character-ui-v2');
const manifest=JSON.parse(await readFile(join(source,'assets.json'),'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
await mkdir(target,{recursive:true});
for(const asset of manifest.assets){
  if(!/^[a-z0-9-]+\.webp$/.test(asset.file))throw new Error('Invalid character UI artifact filename.');
  const bytes=await readFile(join(source,asset.file));
  if(hash(bytes)!==asset.sha256)throw new Error(`Character UI asset changed: ${asset.id}`);
  await writeFile(join(target,asset.file),bytes);
}
console.log(`Copied ${manifest.assets.length} character UI art products; visual decisions are recorded separately.`);
