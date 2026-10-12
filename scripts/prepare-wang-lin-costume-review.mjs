import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let sharp;
try{sharp=require('sharp');}catch{sharp=require(resolve(process.env.USERPROFILE??process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const folder='docs/design/characters/wang-lin-costume-review-v2';await mkdir(folder,{recursive:true});
const basePath='docs/design/characters/wang-lin-chibi-walk-v1/native-v2/frames/wanglin_chibi_stand_south.png';await copyFile(basePath,folder+'/baseline.png');
await sharp(basePath).resize(1024,1536,{kernel:'nearest'}).png().toFile(folder+'/edit-target-16x.png');
const palette=JSON.parse(await readFile('docs/design/characters/wang-lin-chibi-walk-v1/native-v2/atlas.json','utf8')).palette;
const cloth=new Set(palette.slice(5,12).concat(palette.slice(20)).map(x=>x.toUpperCase()));
const {data}=await sharp(basePath).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const mask=Buffer.alloc(64*96*4),overlay=Buffer.from(data);let count=0;
// Author a garment edit mask, not new body/face pixels. Dark hair/outline and skin stay locked.
for(let y=0;y<96;y++)for(let x=0;x<64;x++){
 const i=(y*64+x)*4,hex='#'+[...data.subarray(i,i+4)].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
 const inSleeve=y>=50&&y<=66&&((x>=15&&x<=24)||(x>=42&&x<=49));
 const inChest=y>=50&&y<=60&&x>=28&&x<=38;
 const inSkirt=y>=61&&y<=81&&x>=21&&x<=45;
 const editable=data[i+3]===255&&(inSleeve||inChest||inSkirt)&&cloth.has(hex);
 mask.set(editable?[255,255,255,255]:[0,0,0,255],i);
 if(editable){count++;overlay.set([41,202,175,255],i);}
}
await sharp(mask,{raw:{width:64,height:96,channels:4}}).png().toFile(folder+'/garment-mask.png');
await sharp(mask,{raw:{width:64,height:96,channels:4}}).resize(1024,1536,{kernel:'nearest'}).png().toFile(folder+'/garment-mask-16x.png');
await sharp(overlay,{raw:{width:64,height:96,channels:4}}).resize(512,768,{kernel:'nearest'}).png().toFile(folder+'/garment-region-guide.png');
const regions={frame:[64,96],anchor:[32,88],baselinePath:basePath,baselineHash:createHash('sha256').update(await readFile(basePath)).digest('hex'),maskWhite:'Only authored fabric regions; retains alpha/outline, head y<50, skin colors, dark hair clusters and shoes y>=82',editablePixels:count,lockedHeadRows:[0,49],lockedShoeRows:[82,95],clothPaletteIndices:[5,6,7,8,9,10,11,20,21,22,23],regions:{sleeve:{y:[50,66],x:[[15,24],[42,49]]},chest:{y:[50,60],x:[28,38]},skirt:{y:[61,81],x:[21,45]}}};
await writeFile(folder+'/edit-regions.json',JSON.stringify(regions,null,2)+'\n');
console.log(JSON.stringify({editablePixels:count,frame:[64,96],rescaleBody:false}));
