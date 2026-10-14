import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(fileURLToPath(import.meta.url)),V2=path.dirname(ROOT),V1=path.resolve(V2,'../wang-lin-equipment-production-v1');
const directions=['south','southwest','west','northwest','north','northeast','east','southeast'];
const specs=[];
for(const identityId of ['a','b']){
 const sourceFile=path.join(V1,'sources/gear/sword-'+identityId+'.png'),input='gear/sword/inputs/sword-'+identityId+'-pilot.png';
 const sourceBytes=await readFile(sourceFile);
 await mkdir(path.join(V2,'gear/sword/inputs'),{recursive:true});await mkdir(path.join(V2,'gear/sword/sources'),{recursive:true});
 await copyFile(sourceFile,path.join(V2,input));
 const prompt=[
  'Use case: stylized-concept',
  'Asset type: genuine directional PHYSICAL sword sprite sheet for a pixel xianxia character equipment system.',
  'Image 1 is the owner-approved own physical sword master. Preserve its exact guard, pommel, materials and palette; the figure/body is absent. Identity '+identityId+' equipment only.',
  'Make one transparent 1536x1536 sheet with EXACTLY 3 columns and 3 rows, nine 512x512 cells. Each cell has one complete isolated physical sword, no player, hands, body, sheath, aura, glow, magic trail, ground or shadow. No labels or cell lines.',
  'Reading order: row1 SOUTH front view, SOUTHWEST front-left view, WEST side view; row2 NORTHWEST rear-left view, NORTH rear view, NORTHEAST rear-right view; row3 EAST side view, SOUTHEAST front-right approved rest view, repeated SOUTHEAST neutral calibration.',
  'These are eight genuinely drawn object views from the corresponding wearer/camera yaw. Change visible blade face, ridge, beveled guard thickness, pommel facets and tassel overlaps for the view. Side views are visibly edge-on. Rear views show the opposite blade face and back of the guard. Do NOT mirror or rotate one sprite to pretend it is another view.',
  'The sword hangs lowered in the resting grip, blade generally downward with mild diagonal natural to each view; SOUTHEAST matches Image1. All cells use identical physical sword size and camera scale; do not fit each view to a different size. Keep the handle center around (256,180) in every cell and every part within the middle 320x380 footprint, at least 64 transparent pixels from cell edges.',
  identityId==='a'?'A sword: charcoal dark-metal blade with restrained narrow ivory ridge, aged-bronze angular diamond guard and diamond pommel, wrapped black handle, no tassel.':'B sword: pale ivory steel with muted celadon central ridge, old-metal rounded diamond guard holding jade, round jade pommel and small dark teal tassel. Preserve these physical ornaments in every view.',
  'Style: crisp hand-authored clustered pixel art at enlarged source resolution; sturdy contour and clean material planes consistent with the approved master. Native whole physical height is later registered to about '+(identityId==='a'?'33':'30')+' world pixels beside an80px wearer; do not invent a giant sword.',
  'Background: genuinely transparent RGBA. Absolutely no baked checkerboard or opaque/color haze. Keep all six/other-cell silhouettes separate; no crossing row/column borders.'
 ].join('\n');
 const id='sword-'+identityId+'-views',promptFile='gear/sword/sources/'+id+'.prompt.txt';
 await writeFile(path.join(V2,promptFile),prompt+'\n');
 specs.push({id,familyId:'sword',identityId,layout:'3x3/eight-real-views-plus-SE-calibration',directions,calibrationCell:8,inputs:[{file:input,role:'approved-own-physical-gear-primary',sha256:createHash('sha256').update(sourceBytes).digest('hex')}],prompt:promptFile,nativePhysicalHeight:identityId==='a'?33:30,canvas:[192,192],pivot:[96,160],registeredGrip:[96,128],selectedProductionDirections:directions.filter(d=>d!=='southeast'),southeastPolicy:'Reuse V1 physical artwork byte-for-byte; generated SE view is comparison/calibration only.'});
}
await writeFile(path.join(ROOT,'plan.json'),JSON.stringify({schema:'wang-lin-equipment-physical-gear-plan-2',date:'2026-10-14',directionPolicy:'True source perspective, no mirror/rotation to manufacture views.',sourcePolicy:'Built-in ImageGen; selected raw/prompt/input/hash retained in new package.',records:specs,ownerApproved:false,runtimeIntegrated:false},null,2)+'\n');
console.log(JSON.stringify({specs:specs.length,root:ROOT}));
