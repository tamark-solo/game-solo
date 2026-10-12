import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),folder=resolve(root,'docs/design/ui/dao-dual-theme-v1'),target=resolve(root,'client/public/assets/dao-dual-theme-v1');
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const hash=b=>createHash('sha256').update(b).digest('hex');
function aperture(data,info,start){
 const hole=new Uint8Array(info.width*info.height),queue=new Int32Array(hole.length);let head=0,tail=0,l=info.width,t=info.height,r=0,b=0;
 if(data[start*4+3]>32)throw new Error('Expected a transparent aperture seed.');hole[start]=1;queue[tail++]=start;
 while(head<tail){const i=queue[head++],x=i%info.width,y=Math.floor(i/info.width);if(!x||!y||x===info.width-1||y===info.height-1)throw new Error('Aperture escapes frame.');l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);for(const n of [i-1,i+1,i-info.width,i+info.width])if(!hole[n]&&data[n*4+3]<=32){hole[n]=1;queue[tail++]=n;}}
 return {hole,pixels:tail,bounds:[l,t,r+1,b+1]};
}
const themes={},assets=[],masks=[];
for(const theme of ['tu-dao','doa-ma']){
 const themeFolder=resolve(folder,theme),publicFolder=resolve(target,theme);await mkdir(publicFolder,{recursive:true});
 for(const id of ['hud','window','button']){
  const source=await readFile(resolve(themeFolder,id+'-source.png')),meta=await sharp(source).metadata();if(!meta.hasAlpha)throw new Error('Generated alpha missing.');
  const raw=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});let crop;
  if(id==='hud'){if(meta.width!==2172||meta.height!==724)throw new Error('HUD source geometry changed.');crop={left:0,top:159,width:2172,height:400};
   const ratio=760/meta.width,box=(px)=>{const part=aperture(raw.data,raw.info,Math.round(px*meta.width)+369*meta.width).bounds;const size=Math.min(part[2]-part[0],part[3]-part[1])*ratio-.8;return {left:((part[0]+part[2])/2)*ratio-size/2,top:((part[1]+part[3])/2-crop.top)*ratio-size/2,size};};
   const hp=box(.134),mp=box(.866),bounds=aperture(raw.data,raw.info,Math.floor(meta.width/2)+380*meta.width).bounds;
   const tray={left:bounds[0]*ratio,top:(bounds[1]-crop.top)*ratio,width:(bounds[2]-bounds[0])*ratio,height:(bounds[3]-bounds[1])*ratio};
   themes[theme]={hp,mp,tray,slotTop:tray.top+(tray.height-36)/2};
  }else{let l=meta.width,t=meta.height,r=-1,b=-1;for(let y=0;y<meta.height;y++)for(let x=0;x<meta.width;x++)if(raw.data[(y*meta.width+x)*4+3]>1){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}if(r<0)throw new Error('Empty asset.');l=Math.max(0,l-4);t=Math.max(0,t-4);r=Math.min(meta.width-1,r+4);b=Math.min(meta.height-1,b+4);crop={left:l,top:t,width:r-l+1,height:b-t+1};}
  const output=await sharp(source).extract(crop).resize({width:id==='hud'?1520:id==='window'?1024:900,kernel:'lanczos3'}).webp({quality:94,alphaQuality:100}).toBuffer();
  const file=id+'.webp';await writeFile(resolve(themeFolder,file),output);await writeFile(resolve(publicFolder,file),output);
  const out=await sharp(output).ensureAlpha().raw().toBuffer({resolveWithObject:true});if(id==='hud'&&(out.info.width!==1520||out.info.height!==280))throw new Error('Native HUD must stay 760x140 at 2x density.');
  assets.push({theme,id,file:`${theme}/${file}`,source:`${theme}/${id}-source.png`,prompt:`${theme}/${id}.prompt.txt`,sourceSize:[meta.width,meta.height],sourceSha256:hash(source),crop,size:[out.info.width,out.info.height],bytes:output.length,sha256:hash(output),hasAlpha:true,slice:id==='window'?.22:id==='button'?.15:undefined});
  if(id==='window'){
   const {hole,pixels}=aperture(out.data,out.info,Math.floor(out.info.width/2)+Math.floor(out.info.height/2)*out.info.width),slice=.22;
   const xs=[0,out.info.width*slice,out.info.width*(1-slice),out.info.width],ys=[0,out.info.height*slice,out.info.height*(1-slice),out.info.height],names=[['tl','t','tr'],['l','c','r'],['bl','b','br']];
   for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    const [l,t,r,b]=[xs[col],ys[row],xs[col+1],ys[row+1]],runs=[];
    for(let y=Math.floor(t);y<Math.ceil(b);y++){let x=Math.floor(l);while(x<Math.ceil(r)){if(!hole[y*out.info.width+x]){x++;continue;}const begin=x;while(x<Math.ceil(r)&&hole[y*out.info.width+x])x++;const sx=Math.max(begin,l),ex=Math.min(x,r),sy=Math.max(y,t),ey=Math.min(y+1,b);if(ex>sx&&ey>sy)runs.push(`M${sx} ${sy}h${ex-sx}v${ey-sy}h${sx-ex}Z`);}}
    const name=`frame-aperture-${names[row][col]}.svg`,svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${l} ${t} ${r-l} ${b-t}" preserveAspectRatio="none"><path fill="white" d="${runs.join('')}"/></svg>\n`;await writeFile(resolve(themeFolder,name),svg);await writeFile(resolve(publicFolder,name),svg);masks.push({theme,file:`${theme}/${name}`,sha256:hash(svg),bytes:Buffer.byteLength(svg)});
   }
   await writeFile(resolve(themeFolder,'aperture.json'),JSON.stringify({source:file,sourceSha256:hash(output),slice,alphaThreshold:32,enclosed:true,pixels},null,2)+'\n');
  }
 }
 const iconSource=await readFile(resolve(themeFolder,'icons-source.png')),iconMeta=await sharp(iconSource).metadata();
 if(iconMeta.width!==iconMeta.height*3)throw new Error('Icons require three equal square cells.');
 const icons=await sharp(iconSource).resize({width:384,kernel:'lanczos3'}).webp({quality:94}).toBuffer();
 await writeFile(resolve(themeFolder,'icons.webp'),icons);await writeFile(resolve(publicFolder,'icons.webp'),icons);
 assets.push({theme,id:'icons',file:`${theme}/icons.webp`,source:`${theme}/icons-source.png`,prompt:`${theme}/icons.prompt.txt`,sourceSize:[iconMeta.width,iconMeta.height],sourceSha256:hash(iconSource),size:[384,128],bytes:icons.length,sha256:hash(icons),cells:3,order:['sword','thunder','wind']});
}
const references=[];for(const path of ['docs/design/world/hang-nhac-van-ngoc-concept-v1/concept.webp',...['hud','window','button','icons'].map(id=>`docs/design/ui/dao-dual-theme-v1/guides/${id}.png`)])references.push({path,sha256:hash(await readFile(resolve(root,path)))});
for(const asset of assets)asset.inputs=asset.theme==='tu-dao'?[{path:`guides/${asset.id}.png`,role:'geometry edit target'},{path:'docs/design/world/hang-nhac-van-ngoc-concept-v1/concept.webp',role:'map style reference; workspace-root'}]:[{path:`tu-dao/${asset.id}-source.png`,role:'new paired Tu Đạo edit target'}];
const manifest={date:'2026-10-11',tool:'built-in image_gen',status:'dual-theme-prototype-pending-review',ownerApproved:false,artApproved:false,runtimeIntegrated:false,processing:'Generated source unchanged. Delivery crop, uniform Lanczos3 resize and WebP. HUD apertures measured for UI positioning; window aperture traced into matching nine SVG slices. No pixel repaint, tint, mask, sharpening or blur.',references,assets,masks,layout:themes};
await writeFile(resolve(folder,'assets.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(resolve(target,'layout.json'),JSON.stringify(themes)+'\n');
await writeFile(resolve(target,'concept.webp'),await readFile(resolve(root,'docs/design/world/hang-nhac-van-ngoc-concept-v1/concept.webp')));
console.log(JSON.stringify({assets:assets.length,masks:masks.length,bytes:assets.reduce((s,a)=>s+a.bytes,0),layout:themes}));
