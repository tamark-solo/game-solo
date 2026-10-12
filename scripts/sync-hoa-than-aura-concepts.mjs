import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
const folder='docs/design/vfx/hoa-than-aura-concepts-v4',target='client/public/assets/hoa-than-aura-concepts-v4',m=JSON.parse(await readFile(folder+'/assets.json','utf8'));await mkdir(target,{recursive:true});
for(const a of m.assets){if(!/^[a-z-]+\.png$/.test(a.file))throw new Error('Invalid concept filename');const bytes=await readFile(folder+'/'+a.file);if(createHash('sha256').update(bytes).digest('hex')!==a.sha256)throw new Error('Concept hash mismatch');await writeFile(target+'/'+a.file,bytes);}
console.log('Prepared three aura concepts for art review.');
