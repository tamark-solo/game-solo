import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);let sharp;
try{sharp=require('sharp');}catch{sharp=require(resolve(process.env.USERPROFILE??process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const folder='docs/design/characters/wang-lin-costume-review-v2',hash=b=>createHash('sha256').update(b).digest('hex');
const regions=JSON.parse(await readFile(folder+'/edit-regions.json','utf8')),variants=JSON.parse(await readFile(folder+'/variants.json','utf8'));assert.equal(variants.length,3);
const baseline=await readFile(folder+'/baseline.png'),original=await readFile(regions.baselinePath);
assert.equal(hash(baseline),regions.baselineHash);assert.equal(hash(original),regions.baselineHash);
const base=await sharp(baseline).ensureAlpha().raw().toBuffer({resolveWithObject:true}),mask=await sharp(folder+'/garment-mask.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
const assets=[],results=[];
async function saveAsset(id,file,bytes,size,role){await writeFile(folder+'/'+file,bytes);const asset={id,file,size,sha256:hash(bytes),bytes:bytes.length,role};assets.push(asset);return asset;}
await saveAsset('baseline','baseline.png',baseline,[64,96],'Current Wang Lin, byte-identical');
await saveAsset('baseline-preview','baseline-preview.png',await sharp(baseline).resize(512,768,{kernel:'nearest'}).png().toBuffer(),[512,768],'Current Wang Lin nearest 8x');
const identityPath='docs/design/characters/wang-lin-initiation-v2.png',identity=await readFile(identityPath);
await saveAsset('identity-reference','identity-reference.webp',await sharp(identity).webp({quality:94}).toBuffer(),[1536,1024],'Approved identity source, retained after cleanup');
let previous;try{previous=JSON.parse(await readFile(folder+'/assets.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
for(const variant of variants){
 assert.ok(/^[a-z]+(?:-[a-z]+)*$/.test(variant.id));
 const sourceFile=variant.id+'-source.png',source=await readFile(folder+'/'+sourceFile),sourceMeta=await sharp(source).metadata();
 assert.equal(sourceMeta.width/sourceMeta.height,64/96,'Full reference canvas, no actor recrop');
 const paint=await sharp(source).resize(64,96,{kernel:'nearest',fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true}),colors=variant.palette.map(h=>[1,3,5].map(k=>parseInt(h.slice(k,k+2),16)));
 const out=Buffer.from(base.data);let editable=0,changed=0;
 // Assemble only ImageGen fabric pixels into the immutable native base; no body redraw.
 for(let i=0;i<out.length;i+=4){
  if(mask.data[i]!==255)continue;editable++;assert.equal(base.data[i+3],255);assert.ok(paint.data[i+3]>=128,'Registered fabric paint');
  let best=colors[0],distance=Infinity;for(const c of colors){const d=.299*(paint.data[i]-c[0])**2+.587*(paint.data[i+1]-c[1])**2+.114*(paint.data[i+2]-c[2])**2;if(d<distance){distance=d;best=c;}}
  out.set(best,i);if(!out.subarray(i,i+4).equals(base.data.subarray(i,i+4)))changed++;
 }
 assert.equal(editable,regions.editablePixels);assert.ok(changed>300);
 const study=await sharp(out,{raw:{width:64,height:96,channels:4}}).png({compressionLevel:9}).toBuffer(),decoded=await sharp(study).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.ok(decoded.data.equals(out),'Lossless preservation of locked pixels');
 let protectedChanges=0,headChanges=0,skinChanges=0,shoeChanges=0,alphaChanges=0,left=64,top=96,right=-1,bottom=-1;
 const used=new Set(),skin=new Set(['#A96850','#CC9873','#E5B88F','#F2CEA6']);
 for(let y=0;y<96;y++)for(let x=0;x<64;x++){
  const i=(y*64+x)*4,a=base.data.subarray(i,i+4),b=decoded.data.subarray(i,i+4),different=!a.equals(b),rgb='#'+[...a.subarray(0,3)].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
  if(different&&mask.data[i]!==255)protectedChanges++;if(different&&y<=49)headChanges++;if(different&&skin.has(rgb))skinChanges++;if(different&&y>=82)shoeChanges++;
  if(a[3]!==b[3])alphaChanges++;if(b[3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}used.add([...b].join(','));
 }
 assert.deepEqual([protectedChanges,headChanges,skinChanges,shoeChanges,alphaChanges],[0,0,0,0,0]);assert.deepEqual([left,top,right-left+1,bottom-top+1],[9,9,45,80]);
 const native=await saveAsset(variant.id,variant.id+'.png',study,[64,96],'Costume-only south idle, pending visual review'),preview=await saveAsset(variant.id+'-preview',variant.id+'-preview.png',await sharp(study).resize(512,768,{kernel:'nearest'}).png().toBuffer(),[512,768],'Final native costume nearest 8x, not raw generated face');
 const result={...variant,source:{file:sourceFile,size:[sourceMeta.width,sourceMeta.height],sha256:hash(source),role:'Generated fabric paint; non-garment pixels discarded'},prompt:variant.id+'.prompt.txt',promptSha256:hash(await readFile(folder+'/'+variant.id+'.prompt.txt')),ownerApproved:false,artApproved:false,status:'pending-owner-costume-review',checks:{editablePixels:editable,changedFabricPixels:changed,protectedPixelChanges:protectedChanges,headPixelChanges:headChanges,skinPixelChanges:skinChanges,shoePixelChanges:shoeChanges,alphaPixelChanges:alphaChanges,exactNativeBounds:[left,top,right-left+1,bottom-top+1],usedColors:used.size,losslessRgba:true},native:native.file,preview:preview.file};
 const prior=previous?.variants?.find(v=>v.id===variant.id);if(prior?.source?.sha256===result.source.sha256)for(const key of ['ownerApproved','artApproved','status','approval'])if(prior[key]!==undefined)result[key]=prior[key];results.push(result);
}
const manifest={date:'2026-10-12',id:'CHR-WANG-LIN-COSTUME-REVIEW-02',sourceCharacterId:'CHR-WANG-LIN',scope:'Three independently generated garment designs on the exact current native sprite',tool:'built-in image_gen',ownerApproved:false,artApproved:false,preservationDecision:{accepted:true,evidence:'đúng rồi. Nhưng tranh phụcl chưa đẹp cần thêm một vài trang phục nữa. dọn các asset cũ đã lên',scope:'Accepts preservation of current character; previous and new outfits are not art-approved'},status:'pending-owner-costume-review',inputs:[{file:'edit-target-16x.png',sha256:hash(await readFile(folder+'/edit-target-16x.png')),originalPath:regions.baselinePath,originalSha256:regions.baselineHash,role:'Current native sprite enlarged 16x as edit target'},{file:'garment-mask-16x.png',sha256:hash(await readFile(folder+'/garment-mask-16x.png')),role:'Exact garment edit guide'}],mask:{file:'garment-mask.png',sha256:hash(await readFile(folder+'/garment-mask.png')),regionsFile:'edit-regions.json',editablePixels:regions.editablePixels},identityReference:{originalPath:identityPath,originalSha256:hash(identity)},contract:{framePx:[64,96],anchorPx:[32,88],bodyPx:[45,80],boundsPx:[9,9,45,80],defaultCameraZoom:1,bodyResampling:false,sourceSampling:'Full-frame nearest, only masked fabric copied',alphaValues:[0,255],format:'rgba_png',runtimeIntegrated:false,animation:false,availableDirections:['south']},variants:results,assets};
await writeFile(folder+'/assets.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(results.map(v=>({name:v.name,...v.checks}))));
