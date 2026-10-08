import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const root=resolve(process.argv[2]),data=JSON.parse(await readFile(join(root,'clips.json'),'utf8'));await mkdir(join(root,'atlases'),{recursive:true});
for(const [id,clip]of Object.entries(data.clips)){
 const padding=2,columns=4,cw=clip.frameSize[0]+4,ch=clip.frameSize[1]+4,rows=Math.ceil(clip.frames.length/4);
 const layers=[];
 for(let i=0;i<clip.frames.length;i++){const f=clip.frames[i],input=join(root,f.file),m=await sharp(input).metadata();if(!m.hasAlpha||m.width!==clip.frameSize[0]||m.height!==clip.frameSize[1])throw Error('Invalid PNG '+input);const left=i%4*cw+2,top=Math.floor(i/4)*ch+2;layers.push({input,left,top});f.rect={x:left,y:top,w:m.width,h:m.height};}
 clip.atlas=`atlases/${id}.png`;clip.atlasSize=[columns*cw,rows*ch];clip.padding=padding;
 await sharp({create:{width:columns*cw,height:rows*ch,channels:4,background:'#00000000'}}).composite(layers).png().toFile(join(root,clip.atlas));
}
await writeFile(join(root,'clips.json'),JSON.stringify(data,null,2)+'\n');console.log('Packed',Object.keys(data.clips).length,'atlases from individual PNGs; source PNGs unchanged.');
