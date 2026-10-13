import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url));
const m=JSON.parse(await readFile(root+'manifest.json','utf8'));
const items=m.bodies;
const overlays=[];
for(let i=0;i<items.length;i++){
 const b=items[i],x=(i%3)*256,y=Math.floor(i/3)*414;
 overlays.push({input:await sharp(root+b.file).resize(256,384,{kernel:'nearest'}).png().toBuffer(),left:x,top:y+30});
 const label=b.name.replace('Vương Lâm live · nguyên bản','Vương Lâm live').replace(' · ',' · ');
 overlays.push({input:Buffer.from(`<svg width="256" height="30"><text x="14" y="23" font-family="Segoe UI" font-size="17" fill="#e7e3d5">${label}</text></svg>`),left:x,top:y});
}
await sharp({create:{width:768,height:Math.ceil(items.length/3)*414,channels:4,background:'#344a40'}}).composite(overlays).png().toFile(root+'review/outfits-4x.png');
