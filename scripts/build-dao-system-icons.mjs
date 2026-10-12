import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),sharp=require('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),folder=resolve(root,'docs/design/ui/dao-system-hud-v1');
const sheets={dao:['character','inventory','equipment','cultivation','method','spells','artifact','crafting','appearance','mount','beast','map'],mmo:['quest','party','friends','sect','mail','chat','activities','pve','pvp','achievement','market','settings']};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const reference=async(path,role)=>({path,role,sha256:hash(await readFile(resolve(root,path)))});
const sources=[],assets=[];
for(const theme of ['tu-dao','doa-ma'])for(const [sheet,ids] of Object.entries(sheets)){
 const file=`${theme}/${sheet}-source.png`,bytes=await readFile(resolve(folder,file)),meta=await sharp(bytes).metadata();
 if(!meta.width||!meta.height||!meta.hasAlpha)throw new Error('Missing icon source alpha: '+file);
 if(Math.abs(meta.width/meta.height-4/3)>.03)throw new Error('Expected 4x3 cell sheet: '+file);
 const inputs=theme==='tu-dao'?[
  await reference('docs/design/ui/dao-system-hud-v1/guides/icon-grid.png','geometry guide only; not final art'),
  await reference('docs/design/ui/dao-dual-theme-v1/tu-dao/window.webp','style reference'),
  await reference('docs/design/world/hang-nhac-van-ngoc-concept-v1/concept.webp','style reference')
 ]:[
  await reference(`docs/design/ui/dao-system-hud-v1/tu-dao/${sheet}-source.png`,'edit target'),
  await reference('docs/design/ui/dao-dual-theme-v1/doa-ma/window.webp','style reference'),
  await reference('docs/design/world/hang-nhac-van-ngoc-concept-v1/concept.webp','style reference')
 ];
 const promptFile=`${theme}/${sheet}.prompt.txt`;
 sources.push({file,sha256:hash(bytes),width:meta.width,height:meta.height,grid:{columns:4,rows:3,order:ids},promptFile,promptSha256:hash(await readFile(resolve(folder,promptFile))),inputs});
 for(let cell=0;cell<ids.length;cell++){
  const col=cell%4,row=Math.floor(cell/4),left=Math.floor(col*meta.width/4),top=Math.floor(row*meta.height/3),width=Math.floor((col+1)*meta.width/4)-left,height=Math.floor((row+1)*meta.height/3)-top;
  const raw=await sharp(bytes).extract({left,top,width,height}).ensureAlpha().raw().toBuffer();let minX=width,minY=height,maxX=-1,maxY=-1,opaque=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(raw[(y*width+x)*4+3]>8){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);opaque++;}
  if(maxX<0||opaque/(width*height)>.95)throw new Error('Empty/opaque cell '+ids[cell]);
  const x=Math.max(0,minX-5),y=Math.max(0,minY-5),crop={left:left+x,top:top+y,width:Math.min(width,maxX+6)-x,height:Math.min(height,maxY+6)-y};
  const output=await sharp(bytes).extract(crop).resize(96,96,{fit:'contain',kernel:'lanczos3',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:92,alphaQuality:100}).toBuffer();
  const outFile=`${theme}/${ids[cell]}.webp`;await writeFile(resolve(folder,outFile),output);
  assets.push({id:ids[cell],theme,sheet,cell,source:file,sourceSha256:hash(bytes),cellRect:{left,top,width,height},crop,file:outFile,width:96,height:96,sha256:hash(output),bytes:output.length});
 }
}
await writeFile(resolve(folder,'assets.json'),JSON.stringify({date:'2026-10-11',tool:'built-in image_gen',ownerApproved:false,artApproved:false,runtimeIntegrated:false,status:'full-hud-design-pending-review',processing:'Original PNG retained unchanged. Per-cell delivery crop from alpha bounds; uniform contain downsample to 96px and WebP. No repaint/filter/mask/alpha removal.',sources,assets},null,2)+'\n');
console.log(`Built ${assets.length} Dao HUD navigation icons, ${assets.reduce((sum,a)=>sum+a.bytes,0)} bytes.`);
