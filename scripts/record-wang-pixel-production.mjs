import {readFile,writeFile,copyFile} from 'node:fs/promises';import {resolve,sep} from 'node:path';import {createHash} from 'node:crypto';
try{await readFile('docs/design/characters/actor-animation-standard-v2/approval.json');throw Error('This pack is the accepted production basis. Create a new versioned pack instead of rewriting it.');}catch(e){if(e.code!=='ENOENT')throw e;}

const root='docs/design/characters/wang-lin-pixel-production-v2',plan=JSON.parse(await readFile(root+'/production-plan.json')),generation=JSON.parse(await readFile(root+'/generation.json'));
const sha=b=>createHash('sha256').update(b).digest('hex'),generatedRoot=resolve(process.env.USERPROFILE,'.codex/generated_images');
for(const g of generation.generated){const r=(g.repair?plan.repairs:plan.requests).find(r=>r.direction===g.direction);if(!r)throw Error('Unplanned direction');const source=resolve(g.generatedFile);if(!source.startsWith(generatedRoot+sep)||!source.endsWith('.png'))throw Error('Unexpected generated path');
 await copyFile(source,root+'/'+r.sourceFile);r.status='generated';r.generatedFile=source;r.sourceSha256=sha(await readFile(root+'/'+r.sourceFile));r.promptSha256=sha(await readFile(root+'/'+r.promptFile));r.inputHashes=await Promise.all(r.inputFiles.map(async file=>({file,sha256:sha(await readFile(root+'/'+file))})));}
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({generated:plan.requests.filter(r=>r.status==='generated').map(r=>r.direction),planned:plan.requests.filter(r=>r.status==='planned').map(r=>r.direction)}));
