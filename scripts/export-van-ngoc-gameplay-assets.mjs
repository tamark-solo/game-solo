import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const sharp=require('C:/Users/AnhLT/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=resolve(root,'docs/design/gameplay/van-ngoc-gameplay-assets-v1');
const sha=b=>createHash('sha256').update(b).digest('hex');
const rel=p=>relative(root,p).replaceAll('\\','/');
const batch=JSON.parse(await readFile(resolve(base,'production.json')));
const prepared=JSON.parse(await readFile(resolve(base,'preparation-results.json')));
assert.equal(batch.assets.length,14);assert.equal(batch.recipes.length,6);
assert.equal(sha(await readFile(resolve(root,batch.itemPlan.path))),batch.itemPlan.sha256,'The source recipe plan changed; review before export.');
await mkdir(resolve(base,'native'),{recursive:true});
await mkdir(resolve(base,'review'),{recursive:true});
function bounds(data,info,threshold=64){let left=info.width,top=info.height,right=-1,bottom=-1,count=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>=threshold){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);count++;}
 assert.ok(count>0,'Image has no visible subject');return {left,top,width:right-left+1,height:bottom-top+1};
}
const exports=[];
for(const asset of batch.assets){
 const record=prepared.records.find(r=>r.id===asset.id);assert.ok(record);
 const source=await readFile(record.sourcePath),alpha=await readFile(record.prepared.path);
 assert.equal(sha(source),record.sha256);assert.equal(sha(alpha),record.prepared.sha256);
 const raw=await sharp(alpha).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const visible=bounds(raw.data,raw.info);assert.ok(visible.left>2&&visible.top>2&&visible.left+visible.width<raw.info.width-2&&visible.top+visible.height<raw.info.height-2,'Source subject reaches a canvas edge');
 const crop={left:visible.left-2,top:visible.top-2,width:visible.width+4,height:visible.height+4};
 const sizes=asset.assetType==='icon'?[32,48,64]:[asset.nativeCanvas];
 const files=[];
 for(const size of sizes){
  const [cw,ch]=Array.isArray(size)?size:[size,size],target=asset.assetType==='icon'?[Math.round(cw*.76),Math.round(ch*.76)]:asset.bodySize;
  const factor=Math.min(target[0]/crop.width,target[1]/crop.height),w=Math.max(1,Math.round(crop.width*factor)),h=Math.max(1,Math.round(crop.height*factor));
  const left=Math.floor((cw-w)/2),top=Math.floor((ch-h)/2);
  const subject=await sharp(alpha).extract(crop).resize(w,h,{kernel:'lanczos3'}).png().toBuffer();
  const filename=`${asset.id}${asset.assetType==='icon'?'-'+cw:''}.png`;
  const png=await sharp({create:{width:cw,height:ch,channels:4,background:'#00000000'}}).composite([{input:subject,left,top}]).png().toBuffer();
  await writeFile(resolve(base,'native',filename),png);
  const decoded=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const b=bounds(decoded.data,decoded.info,16);assert.ok(b.left>0&&b.top>0&&b.left+b.width<cw&&b.top+b.height<ch,'Native asset clipped');
  let magenta=0,edgePixels=0;for(let i=0;i<decoded.data.length;i+=4){const [r,g,bl,a]=decoded.data.subarray(i,i+4);if(a>32&&r>g+40&&bl>g+40&&r>120&&bl>120)magenta++;}
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if((x===0||y===0||x===cw-1||y===ch-1)&&decoded.data[(y*cw+x)*4+3]>0)edgePixels++;
  assert.equal(magenta,0,'Visible key spill in native export');assert.equal(edgePixels,0,'Native export touches canvas edge');
  files.push({path:`native/${filename}`,filename,width:cw,height:ch,bytes:png.length,sha256:sha(png),url:`/assets/van-ngoc-gameplay-v1/${filename}`,contentBounds:b,placement:{left,top,width:w,height:h},kernel:'lanczos3',magentaPixels:magenta,canvasEdgePixels:edgePixels});
 }
 exports.push({id:asset.id,label:asset.label,itemId:asset.itemId??null,stage:asset.stage,state:asset.state??null,assetType:asset.assetType,source:{path:rel(record.sourcePath),sha256:record.sha256,dimensions:record.dimensions,manifest:rel(record.manifestPath)},alpha:{path:rel(record.prepared.path),sha256:record.prepared.sha256,sourceCanvasPreserved:true},crop:{...crop,boundsThreshold:64},files,pivot:null,pivotStatus:asset.assetType==='prop'?'pending-manual-base-measurement':'not-applicable-ui-icon',ownerApproved:false,artApproved:false});
}
const actorPath='docs/design/characters/wang-lin-chibi-walk-v1/native-v2/frames/wanglin_chibi_stand_south.png';
const actor=await readFile(resolve(root,actorPath)),actorInfo=await sharp(actor).metadata();assert.equal(actorInfo.width,64);assert.equal(actorInfo.height,96);
await writeFile(resolve(base,'review','actor-64x96.png'),actor);
const mapPath='docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp';
const map=await readFile(resolve(root,mapPath)),approval=JSON.parse(await readFile(resolve(root,batch.styleBaseline.approval)));
assert.equal(sha(map),approval.web.sha256);
const backdrop=await sharp(map).extract({left:1370,top:1060,width:600,height:240}).png().toBuffer();await writeFile(resolve(base,'review','map-crop.png'),backdrop);
const header=(text,width=360)=>Buffer.from(`<svg width="${width}" height="32"><text x="12" y="22" font-family="Arial" font-size="15" fill="#eee">${text}</text></svg>`);
const iconParts=[];
for(let i=0;i<11;i++){
 const a=exports[i],x=(i%3)*360,y=Math.floor(i/3)*160;iconParts.push({input:header(a.id),left:x,top:y});
 for(const [col,bg] of ['#f2ebd5','#10272c'].entries()){
  const panel=await sharp({create:{width:172,height:116,channels:4,background:bg}}).composite(await Promise.all(a.files.map(async (f,j)=>({input:await readFile(resolve(base,f.path)),left:[4,42,98][j],top:Math.floor((116-f.height)/2)})))).png().toBuffer();iconParts.push({input:panel,left:x+8+col*174,top:y+34});
 }
}
await sharp({create:{width:1080,height:640,channels:3,background:'#263b3f'}}).composite(iconParts).png().toFile(resolve(base,'review','icons-native-board.png'));
const propParts=[];
for(let i=0;i<3;i++){
 const a=exports[11+i],f=a.files[0],y=i*280;propParts.push({input:header(a.id,600),left:0,top:y});propParts.push({input:backdrop,left:0,top:y+32});
 propParts.push({input:await readFile(resolve(base,f.path)),left:Math.round(210-f.width/2),top:y+40});propParts.push({input:actor,left:300,top:y+140});
}
await sharp({create:{width:600,height:840,channels:3,background:'#10272c'}}).composite(propParts).png().toFile(resolve(base,'review','props-native-board.png'));
// Large alpha inspection panels are review artifacts, never substitute world ART.
const alphaParts=[];
for(let i=0;i<14;i++){
 const record=prepared.records[i],a=exports[i],x=(i%4)*300,y=Math.floor(i/4)*320;
 const subject=await sharp(record.prepared.path).extract(a.crop).resize(270,270,{fit:'contain',background:'#00000000'}).png().toBuffer();
 const halfLight=await sharp({create:{width:300,height:288,channels:4,background:'#f2ebd5'}}).composite([{input:Buffer.from('<svg width="150" height="288"><rect width="150" height="288" fill="#10272c"/></svg>'),left:150,top:0},{input:subject,left:15,top:10}]).png().toBuffer();
 alphaParts.push({input:header(a.id,300),left:x,top:y},{input:halfLight,left:x,top:y+32});
}
await sharp({create:{width:1200,height:1280,channels:3,background:'#263b3f'}}).composite(alphaParts).png().toFile(resolve(base,'review','alpha-light-dark-board.png'));
const manifest={schema:'game-solo-gameplay-art-review-1',id:batch.id,status:'native-review-pending-owner',date:batch.date,ownerApproved:false,artApproved:false,runtimeConsumable:false,sourcePlan:batch.itemPlan,styleBaseline:batch.styleBaseline,character:{...batch.character,source:actorPath,sha256:sha(actor),url:'/assets/van-ngoc-gameplay-v1/actor-64x96.png'},assets:exports,recipes:batch.recipes,sources:batch.sources,existingItems:batch.existingItemReferences,review:{alpha:'pending-visual-inspection',native:'pending-visual-inspection',worldPlacement:'not-produced',collision:'not-produced'},notes:batch.notes};
await writeFile(resolve(base,'assets.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Exported ${exports.length} assets (${exports.reduce((n,a)=>n+a.files.length,0)} PNGs), native/alpha boards and exact recipe links.`);
