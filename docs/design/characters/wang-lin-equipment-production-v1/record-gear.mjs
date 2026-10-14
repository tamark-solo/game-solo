import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const [id, source] = process.argv.slice(2);
if (!/^(sword|banner|chariot|bead)-[ab]$/.test(id ?? '') || !source) throw new Error('Expected equipment ID and generated raw file');
try { await fs.access(path.join(root, 'approval.json')); throw new Error('Approved production root is immutable'); }
catch (e) { if (e.code !== 'ENOENT') throw e; }
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const relative = `sources/gear/${id}.png`;
const destination = path.join(root, relative);
try { await fs.access(destination); throw new Error('Source exists; record a sibling version instead'); }
catch (e) { if (e.code !== 'ENOENT') throw e; }
await fs.mkdir(path.dirname(destination), {recursive:true});
await fs.copyFile(source, destination);
const prompt = `sources/gear/${id}.prompt.txt`;
const input = `../wang-lin-concept-direction-v5/sources/${id === 'banner-a' ? 'banner-a-r2' : id}.png`;
let data = {schema:'wang-lin-equipment-gear-generation-1',tool:'built-in-imagegen',date:'2026-10-14',ownerApproved:false,runtimeIntegrated:false,sources:[]};
try { data = JSON.parse(await fs.readFile(path.join(root,'gear-generation.json'),'utf8')); }
catch (e) { if (e.code !== 'ENOENT') throw e; }
data.sources.push({id,source:relative,sha256:hash(await fs.readFile(destination)),prompt,promptSha256:hash(await fs.readFile(path.join(root,prompt))),inputs:[{file:input,sha256:hash(await fs.readFile(path.resolve(root,input)))}],generatedFile:source,transparentRequested:true,kind:'isolated-resting-equipment',direction:'southeast',ownerApproved:false});
await fs.writeFile(path.join(root,'gear-generation.json'), JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({id,saved:relative,sha256:data.sources.at(-1).sha256}));
