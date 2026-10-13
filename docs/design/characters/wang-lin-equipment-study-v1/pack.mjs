import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { sharp } from '../../../../scripts/actor-sprite-tools.mjs';

// Scoped technical extraction/registration. Sources and live body are never overwritten.
const root=dirname(fileURLToPath(import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const bodyPath=resolve(root,'inputs/wang-lin-live-southeast-native.png');
const bodyBytes=await readFile(bodyPath);
if(hash(bodyBytes)!=='78d0fb7e2e159334e65707423d8da2e4608d75e0845dcd3db677a3d1d2a14431')throw new Error('Unexpected live body');
const liveAtlas=resolve(root,'../../../../client/public/assets/hang-nhac-pixel-player/atlases/idle-southeast.png');
const liveRaw=await sharp(liveAtlas).extract({left:2,top:2,width:64,height:96}).ensureAlpha().raw().toBuffer();
const bodyRaw=await sharp(bodyBytes).ensureAlpha().raw().toBuffer();
if(!liveRaw.equals(bodyRaw))throw new Error('Body differs from actual live atlas');
const canvas=[128,128],pivot=[48,112],bodyOffset=[16,24],hand=[43,64];
const specs=[
 {id:'sword',name:'Thanh Ngọc Kiếm',description:'Kiếm thẳng nhẹ; hướng trải nghiệm chém–đâm và điều khiển phi kiếm.',sourceGrip:[293,363],rotate:-45,scale:0.035,notes:'Đăng ký xoay nguồn -45° trước nearest; kiếm nằm chếch ngang để đầu mũi không xuyên đất.'},
 {id:'spear',name:'Trường Thương Huyền Mộc',description:'Thương dài; hướng trải nghiệm giữ cự ly và đâm theo đường thẳng.',sourceGrip:[492,994],rotate:0,scale:94/1308,notes:'Nguồn thương được giữ góc nghiêng; chỉ một scale cho toàn vật.'},
 {id:'fan',name:'Vân Ngọc Linh Phiến',description:'Quạt ngọc ngà; hướng trải nghiệm quét hình quạt và vận pháp từ xa.',sourceGrip:[579,860],rotate:0,scale:28/1136,notes:'Nguồn có haze alpha; binary-alpha 128 để bỏ haze trong bản pixel thử.'},
 {id:'gourd',name:'Tụ Linh Hồ Lô',description:'Hồ lô pháp bảo; hướng trải nghiệm tích khí, phóng khí và chuẩn bị trước giao tranh.',sourceGrip:[530,337],rotate:0,scale:24/926,notes:'Gắn vòng dây vào tay; thân hồ lô và hiệu ứng vận khí tách riêng.'}
];
function bounds(data,w,h){let l=w,t=h,r=-1,b=-1,n=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);n++;}if(r<0)throw new Error('Empty alpha');return {left:l,top:t,width:r-l+1,height:b-t+1,opaquePixels:n};}
await mkdir(resolve(root,'equipment'),{recursive:true});
await mkdir(resolve(root,'review'),{recursive:true});
const equipment=[],registration=[];
for(const s of specs){
 const sourceFile='sources/'+s.id+'-source.png',source=await readFile(resolve(root,sourceFile));
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const matte=Buffer.from(data);let removed=0;
 for(let i=3;i<matte.length;i+=4){if(matte[i]<128){if(matte[i]>0)removed++;matte[i]=0;matte[i-1]=matte[i-2]=matte[i-3]=0;}else matte[i]=255;}
 let prepared=await sharp(matte,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
 let grip=[...s.sourceGrip];
 if(s.rotate){
  prepared=await sharp(prepared).rotate(s.rotate,{background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  const m=await sharp(prepared).metadata(),rad=s.rotate*Math.PI/180;
  const x=grip[0]-info.width/2,y=grip[1]-info.height/2;
  grip=[Math.cos(rad)*x-Math.sin(rad)*y+m.width/2,Math.sin(rad)*x+Math.cos(rad)*y+m.height/2];
 }
 const rotated=await sharp(prepared).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=3;i<rotated.data.length;i+=4)rotated.data[i]=rotated.data[i]>=128?255:0;
 const box=bounds(rotated.data,rotated.info.width,rotated.info.height);
 const w=Math.round(box.width*s.scale),h=Math.round(box.height*s.scale);
 const item=await sharp(rotated.data,{raw:{width:rotated.info.width,height:rotated.info.height,channels:4}}).extract({left:box.left,top:box.top,width:box.width,height:box.height}).resize(w,h,{fit:'fill',kernel:'nearest'}).png().toBuffer();
 const itemGrip=[Math.round((grip[0]-box.left)*w/box.width),Math.round((grip[1]-box.top)*h/box.height)];
 const itemTopLeft=[bodyOffset[0]+hand[0]-itemGrip[0],bodyOffset[1]+hand[1]-itemGrip[1]];
 if(itemTopLeft[0]<0||itemTopLeft[1]<0||itemTopLeft[0]+w>canvas[0]||itemTopLeft[1]+h>canvas[1])throw new Error('Clipped '+s.id);
 const full=await sharp({create:{width:128,height:128,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:item,left:itemTopLeft[0],top:itemTopLeft[1]}]).png().toBuffer();
 const layer=await sharp(full).ensureAlpha().raw().toBuffer();
 const rear=Buffer.alloc(layer.length),front=Buffer.from(layer);
 // Only pixels covered by the unchanged fist go behind it; no invented fingers.
 const mask={left:40,top:61,width:7,height:8};
 for(let y=mask.top;y<mask.top+mask.height;y++)for(let x=mask.left;x<mask.left+mask.width;x++)if(bodyRaw[(y*64+x)*4+3]){
  const i=((y+bodyOffset[1])*128+x+bodyOffset[0])*4;layer.copy(rear,i,i,i+4);front.fill(0,i,i+4);
 }
 const fullFile='equipment/'+s.id+'.png',frontFile='equipment/'+s.id+'-front.png',rearFile='equipment/'+s.id+'-rear.png';
 await writeFile(resolve(root,fullFile),full);
 for(const [file,buf] of [[frontFile,front],[rearFile,rear]])await sharp(buf,{raw:{width:128,height:128,channels:4}}).png().toFile(resolve(root,file));
 const bodyCanvas=await sharp({create:{width:128,height:128,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:bodyBytes,left:16,top:24}]).png().toBuffer();
 await sharp(rear,{raw:{width:128,height:128,channels:4}}).composite([{input:bodyCanvas},{input:await readFile(resolve(root,frontFile))}]).png().toFile(resolve(root,'review/'+s.id+'-equipped.png'));
 const sourceSha256=hash(source),promptFile='sources/'+s.id+'.prompt.txt',promptSha256=hash(await readFile(resolve(root,promptFile)));
 equipment.push({id:s.id,name:s.name,description:s.description,file:frontFile,frontFile,rearFile,fullFile,canvas,pivot,bodyOffset,raw:sourceFile,prompt:promptFile,status:'candidate-neutral-southeast',itemLocal:{grip:hand,itemGrip,itemTopLeft,dimensions:[w,h]},sourceSha256,sha256:hash(full),ownerApproved:false,artApproved:false,runtimeReady:false});
 registration.push({id:s.id,source:sourceFile,sourceSha256,sourceSize:[info.width,info.height],sourceGrip:s.sourceGrip,sourceGripBasis:'manual visual landmark: grip centre / hanging cord top',rotateDegrees:s.rotate,scale:s.scale,actualScale:[w/box.width,h/box.height],cropAfterRotation:box,itemGrip,itemTopLeft,handBodyLocal:hand,occlusionMask:mask,canvas,pivot,bodyOffset,pixelsResampled:true,sampling:'nearest after source rotation; source rotation uses Sharp',alpha:{method:'binary-alpha-128',removedLowAlphaPixels:removed},notes:s.notes,quality:'static equipment registration candidate; grip/body motion unresolved',promptFile,promptSha256});
}
const manifest={schema:'wang-lin-equipment-study-1',date:'2026-10-13',stage:'four neutral equipment overlays in southeast view',generation:{method:'built-in image_gen',modelChosenByTool:true,inputRole:'live Wang nearest8x pixel palette and physical scale reference only',transparentBackground:true,routerGenerationUsed:false},body:{file:'inputs/wang-lin-live-southeast-native.png',canvas:[64,96],pivot:[32,88],sha256:hash(bodyBytes),liveAtlas:'client/public/assets/hang-nhac-pixel-player/atlases/idle-southeast.png',liveAtlasSha256:hash(await readFile(liveAtlas)),rect:{x:2,y:2,w:64,h:96},rgbaMatchesLiveFrame:true,pixelsModified:false},equipment,coverage:{direction:'southeast',neutralVariants:4,animationClips:0,otherDirections:0},readiness:{ownerApproved:false,artApproved:false,runtimeIntegrated:false}};
await writeFile(resolve(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(resolve(root,'registration.json'),JSON.stringify({schema:'equipment-static-registration-1',registration},null,2)+'\n');
console.log(JSON.stringify({bodyMatchesLive:true,equipment:equipment.map(e=>({id:e.id,dimensions:e.itemLocal.dimensions,itemTopLeft:e.itemLocal.itemTopLeft,itemGrip:e.itemLocal.itemGrip}))}));
