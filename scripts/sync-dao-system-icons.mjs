import {readFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),folder=resolve(root,'docs/design/ui/dao-system-hud-v1'),target=resolve(root,'client/public/assets/dao-system-hud-v1');
const manifest=JSON.parse(await readFile(resolve(folder,'assets.json'),'utf8'));
if(manifest.assets.length!==48)throw new Error('Expected 24 icons in each of two Dao themes.');
for(const asset of manifest.assets){const source=resolve(folder,asset.file),bytes=await readFile(source);if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('HUD icon hash mismatch: '+asset.file);await mkdir(dirname(resolve(target,asset.file)),{recursive:true});await copyFile(source,resolve(target,asset.file));}
console.log('Prepared 24 system HUD icons in Tu Đạo / Đọa Ma.');
