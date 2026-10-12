import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url); let sharp;
try { sharp = require('sharp'); } catch { sharp = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')); }
const folder = resolve('docs/design/ui/character-van-ngoc-v2'), target = resolve('client/public/assets/character-ui-v2');
await mkdir(target, { recursive: true });
const hash = data => createHash('sha256').update(data).digest('hex');
const assets = [], regions = [];
const sourceStats = async file => {
  const data = await readFile(join(folder, file)); const meta = await sharp(data).metadata();
  const raw = await sharp(data).ensureAlpha().raw().toBuffer();
  let clear = 0, opaque = 0; for (let n=3;n<raw.length;n+=4) { if(raw[n]===0)clear++; if(raw[n]===255)opaque++; }
  return { file, sha256: hash(data), width:meta.width, height:meta.height, hasAlpha:meta.hasAlpha, clearPixels:clear, opaquePixels:opaque, data };
};
const shrine = await sourceStats('shrine-source-v2.png'), items = await sourceStats('items-source-v2.png');
for (const source of [shrine,items]) if(!source.hasAlpha||!source.clearPixels) throw new Error(`${source.file}: expected generated transparent background.`);
const shrineBytes = await sharp(shrine.data).resize({width:600}).webp({quality:92,alphaQuality:100}).toBuffer();
await writeFile(join(folder,'shrine-v2.webp'),shrineBytes); await writeFile(join(target,'shrine-v2.webp'),shrineBytes);
assets.push({id:'shrine',file:'shrine-v2.webp',bytes:shrineBytes.length,sha256:hash(shrineBytes)});
const names = ['wood-sword','jade-sword','plain-robe','cloud-robe','jade-charm','lotus-pill','spirit-pill','herb','ore','manual','sect-seal','cloud-pearl'];
// Measured empty gutters of the generated sheet; uniform thirds would cut the
// robe hems and carry a fragment into the next row. Keep complete source cells.
if(items.width!==1536||items.height!==1024)throw new Error('Re-measure source row gutters before rebuilding a different sheet.');
const rowBands=[0,365,678,1024];
const thumbnails = [], atlasComposites = [];
for(let n=0;n<names.length;n++){
  const col=n%4,row=Math.floor(n/4), left=Math.round(col*items.width/4),top=rowBands[row];
  const crop={left,top,width:Math.round((col+1)*items.width/4)-left,height:rowBands[row+1]-top};
  // Delivery extraction only. Preserve generated alpha/materials, no masking,
  // repaint, background removal, recolor, or non-uniform resizing.
  const buffer=await sharp(items.data).extract(crop).resize(128,128,{fit:'contain',background:'#00000000'}).png().toBuffer();
  const file=`${names[n]}.webp`,bytes=await sharp(buffer).webp({quality:94,alphaQuality:100}).toBuffer();
  await writeFile(join(folder,file),bytes);await writeFile(join(target,file),bytes);
  assets.push({id:names[n],file,bytes:bytes.length,sha256:hash(bytes)});
  regions.push({id:names[n],crop,runtimeSize:[128,128]});
  thumbnails.push({input:buffer,left:col*128,top:row*128});
  atlasComposites.push({input:buffer,left:col*132+2,top:row*132+2});
}
await sharp({create:{width:512,height:384,channels:4,background:'#00000000'}}).composite(thumbnails).png().toFile(join(folder,'contact-sheet.png'));
const atlas=await sharp({create:{width:528,height:396,channels:4,background:'#00000000'}}).composite(atlasComposites).webp({quality:94,alphaQuality:100}).toBuffer();
await writeFile(join(folder,'item-atlas-v2.webp'),atlas);await writeFile(join(target,'item-atlas-v2.webp'),atlas);
assets.push({id:'item-atlas',file:'item-atlas-v2.webp',bytes:atlas.length,sha256:hash(atlas)});
const sources=[shrine,items].map(({data,...source})=>source);
const manifest={version:2,tool:'built_in_imagegen',status:'prototype_pending_visual_review',artApproved:false,ownerApproved:false,
  references:await Promise.all([{path:'../desktop-skill-hud-v3/cultivation-frame-v3.webp',role:'palette/material/style only'},{path:'../desktop-skill-hud-v2/skill-icons-v2.webp',role:'painterly icon style only'}].map(async entry=>({...entry,sha256:hash(await readFile(resolve(folder,entry.path)))}))),
  prompts:['shrine.prompt.txt','items.prompt.txt'],sources,regions,assets,
  rowBands,processing:'Non-destructive export. Uniform shrine downsample to 600px wide; four equal source columns and measured empty row gutters [0,365,678,1024], uniform contain downsample to 128px, transparent padding, WebP with preserved generated alpha; atlas 4×3 with 2px padding. No artwork repainting or alpha removal in code.'};
await writeFile(join(folder,'assets.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({sources,assets:assets.map(({id,bytes})=>({id,bytes}))},null,2));
