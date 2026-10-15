import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

// Copies the approved review materials only. Never invokes the map/actor builders.
const source=resolve('docs/design/ui/ink-paper-web-v1/assets');
const output=resolve('client/public/assets/dao-an-v3');
await mkdir(output,{recursive:true});
const files=[];
for(const name of [...Array.from({length:6},(_,i)=>`font-${i}.ttf`),'dao-paper.png']){
  await copyFile(resolve(source,name),resolve(output,name));
  files.push({name,sha256:createHash('sha256').update(await readFile(resolve(output,name))).digest('hex')});
}
await writeFile(resolve(output,'manifest.json'),JSON.stringify({source:'Đạo Ấn V3 / approved web review',files},null,2));
console.log(`Đạo Ấn V3: ${files.length} existing materials copied.`);
