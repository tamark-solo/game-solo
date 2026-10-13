import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url));
const variants=['stone','cloud','abyss'],names=['Cổ thạch · ngũ vân','Vân ngọc · thanh quang','Huyền thạch · nội giới'];
const overlays=[];
for(let i=0;i<3;i++){
 const x=i*360;
 const image=await sharp(root+'review/composites/bead-'+variants[i]+'--bead-cloud.png').extract({left:52,top:100,width:116,height:112}).resize(348,336,{kernel:'nearest'}).png().toBuffer();
 overlays.push({input:image,left:x+6,top:38});
 overlays.push({input:Buffer.from(`<svg width="360" height="38"><text x="16" y="27" font-family="Segoe UI" font-size="20" fill="#ece7d6">${names[i]}</text></svg>`),left:x,top:0});
}
await sharp({create:{width:1080,height:374,channels:4,background:'#6c7c73'}}).composite(overlays).png().toFile(root+'review/bead-options-3x.png');
