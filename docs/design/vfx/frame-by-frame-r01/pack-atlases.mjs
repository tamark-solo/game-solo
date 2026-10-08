// Normal production build: PNG frames are canonical. This script NEVER rewrites them.
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
const root=dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp');}catch{sharp=require(join(process.env.VFX_NODE_MODULES||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),'sharp'));}
const {clips}=JSON.parse(await readFile(resolve(root,'clips.json'),'utf8'));
for(const [id,clip]of Object.entries(clips)){
 for(const frame of clip.frames){const meta=await sharp(resolve(root,frame.file)).metadata();if(meta.width!==clip.frameSize[0]||meta.height!==clip.frameSize[1]||!meta.hasAlpha)throw new Error(`${frame.file}: expected ${clip.frameSize.join('x')} with alpha`);}
 const png=await sharp({create:{width:clip.atlasSize[0],height:clip.atlasSize[1],channels:4,background:'#00000000'}}).composite(clip.frames.map(frame=>({input:resolve(root,frame.file),left:frame.rect.x,top:frame.rect.y}))).png().toBuffer();
 await writeFile(resolve(root,clip.atlas),png);console.log(`Packed ${id}: ${clip.frames.length} source PNGs unchanged`);
}
