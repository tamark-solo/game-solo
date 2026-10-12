import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),folder=resolve(root,'docs/design/ui/van-ngoc-co-dong-v1'),target=resolve(root,'client/public/assets/van-ngoc-co-dong-v1');
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const manifest=JSON.parse(await readFile(resolve(folder,'assets.json'),'utf8')),frame=manifest.assets.find(a=>a.id==='window'),source=await readFile(resolve(folder,frame.file));
if(createHash('sha256').update(source).digest('hex')!==frame.sha256)throw new Error('Frame hash changed.');
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const hole=new Uint8Array(info.width*info.height),queue=new Int32Array(hole.length);let head=0,tail=0;
const start=Math.floor(info.height/2)*info.width+Math.floor(info.width/2);if(data[start*4+3]>32)throw new Error('Frame center is not clear.');
hole[start]=1;queue[tail++]=start;
while(head<tail){const i=queue[head++],x=i%info.width,y=Math.floor(i/info.width);if(!x||!y||x===info.width-1||y===info.height-1)throw new Error('Aperture reaches outer edge.');for(const n of [i-1,i+1,i-info.width,i+info.width])if(!hole[n]&&data[n*4+3]<=32){hole[n]=1;queue[tail++]=n;}}
const cuts=(size)=>[0,size*frame.slice,size*(1-frame.slice),size],xs=cuts(info.width),ys=cuts(info.height),tiles=[];
const names=[['tl','t','tr'],['l','c','r'],['bl','b','br']];
for(let row=0;row<3;row++)for(let col=0;col<3;col++){
 const [left,top,right,bottom]=[xs[col],ys[row],xs[col+1],ys[row+1]],runs=[];
 for(let y=Math.floor(top);y<Math.ceil(bottom);y++){let x=Math.floor(left);while(x<Math.ceil(right)){if(!hole[y*info.width+x]){x++;continue;}const begin=x;while(x<Math.ceil(right)&&hole[y*info.width+x])x++;const sx=Math.max(begin,left),ex=Math.min(x,right),sy=Math.max(y,top),ey=Math.min(y+1,bottom);if(ex>sx&&ey>sy)runs.push(`M${sx} ${sy}h${ex-sx}v${ey-sy}h${sx-ex}Z`);}}
 const file=`frame-aperture-${names[row][col]}.svg`,svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${right-left} ${bottom-top}" preserveAspectRatio="none"><path fill="white" d="${runs.join('')}"/></svg>\n`;
 await writeFile(resolve(folder,file),svg);await writeFile(resolve(target,file),svg);tiles.push({file,sha256:createHash('sha256').update(svg).digest('hex'),bytes:Buffer.byteLength(svg)});
}
await writeFile(resolve(folder,'frame-aperture.json'),JSON.stringify({type:'derived-vector-aperture',source:frame.file,sourceSha256:frame.sha256,slice:frame.slice,alphaThreshold:32,enclosed:true,filledPixels:tail,tiles,processing:'Trace the center-connected transparent hole into nine SVG viewBoxes. Artwork pixels unchanged; same slices as the displayed frame.'},null,2)+'\n');
console.log(`Cổ đồng aperture: ${tiles.length} slices, enclosed.`);
