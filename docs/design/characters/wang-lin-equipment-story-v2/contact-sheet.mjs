import{sharp}from'../../../../scripts/actor-sprite-tools.mjs';
import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('./',import.meta.url));
const ids=['sword','banner','bead','chariot'];
const labels=['Tiên kiếm · Hứa Lập Quốc','Thập Ức Tôn Hồn Phiên','Thiên Nghịch Châu','Xạ Thần Xa'];
const overlays=[];
for(let i=0;i<4;i++){
 const x=(i%2)*540,y=Math.floor(i/2)*490;
 const img=await sharp(root+'review/'+ids[i]+'-equipped.png').resize(512,448,{kernel:'nearest'}).png().toBuffer();
 overlays.push({input:img,left:x+14,top:y+38});
 const svg=`<svg width="540" height="38"><text x="22" y="27" font-family="Segoe UI" font-size="22" fill="#eae5d7">${labels[i]}</text></svg>`;
 overlays.push({input:Buffer.from(svg),left:x,top:y});
}
await sharp({create:{width:1080,height:980,channels:4,background:'#879189'}}).composite(overlays).png().toFile(root+'review/lineup-2x.png');
