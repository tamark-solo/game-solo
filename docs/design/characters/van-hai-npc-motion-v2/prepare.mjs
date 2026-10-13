import {readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
const root='docs/design/characters/van-hai-npc-motion-v2',baseline='docs/design/characters/van-hai-npc-motion-v1',standard='docs/design/characters/van-hai-npc-visual-standard-v1';
try{await access(root+'/production-plan.json');throw Error('Already prepared; preserve requests and inputs.');}catch(e){if(e.code!=='ENOENT')throw e;}
const hash=b=>createHash('sha256').update(b).digest('hex');
const approval=JSON.parse(await readFile(baseline+'/approval.json','utf8')),prior=JSON.parse(await readFile(baseline+'/production-plan.json','utf8'));
for(const target of approval.pinnedFiles)assert.equal(hash(await readFile(baseline+'/'+target.file)),target.sha256,'Approved NPC baseline changed');
const directions=['south','southwest','west','northwest','north','northeast','east','southeast'];
const facings={
 south:'STRAIGHT FRONT facing screen DOWN. BOTH eyes and eyebrows visible symmetrically, centered nose and torso. Never show side profile.',
 southwest:'FRONT LEFT three-quarter facing screen DOWN-LEFT. Face visible with leftward orientation, actual opposite view, not a mirror of southeast.',
 west:'LEFT PROFILE facing screen LEFT. Only left side of face and one eye visible, nose pointing LEFT. No front-right face.',
 northwest:'BACK LEFT three-quarter facing screen UP-LEFT. Mostly back of skull and robe, only small side contour if reference shows it, no front face.',
 north:'STRAIGHT BACK facing screen UP. Back of skull/bun and back of robe ONLY. Absolutely NO eyes, eyebrows, nose, mouth or front face in ANY frame.',
 northeast:'BACK RIGHT three-quarter facing screen UP-RIGHT. Mostly back of skull and robe, no front face.',
 east:'RIGHT PROFILE facing screen RIGHT. Only right side of face and one eye visible, nose pointing RIGHT. No front-left face.'
};
for(const folder of ['inputs','prompts','specs','plans','raw','review'])await mkdir(root+'/'+folder,{recursive:true});
const liveDirections=JSON.parse(await readFile(standard+'/directions.json','utf8'));
for(const d of liveDirections.directions){
 assert.equal(hash(await readFile(standard+'/'+d.nearest8x)),d.nearest8xSha256);
 for(const [input,target]of [[d.native,'inputs/wang-lin-live-'+d.direction+'-native.png'],[d.nearest8x,'inputs/wang-lin-live-'+d.direction+'-nearest8x.png']])await copyFile(standard+'/'+input,root+'/'+target);
}
const requests=[];
for(const npc of prior.actors){
 const inputIdentity='inputs/'+npc.slug+'-approved-southeast-nearest8x.png';
 await sharp(await readFile(baseline+'/calibration/'+npc.slug+'-southeast.png')).resize(768,768,{kernel:'nearest'}).png().toFile(root+'/'+inputIdentity);
 const inputActions='inputs/'+npc.slug+'-approved-southeast-actions.png';
 await copyFile(baseline+'/'+npc.source,root+'/'+inputActions);
 for(const direction of directions.filter(d=>d!=='southeast')){
  const id=npc.slug+'-'+direction,source='raw/'+id+'.png',promptFile='prompts/'+id+'.txt',images=['inputs/wang-lin-live-'+direction+'-nearest8x.png',inputIdentity,inputActions];
  const prompt=[
   'Create a production pixel game sprite animation sheet with18 isolated FULL BODY poses, exactly6columns by3rows. Request square1536x1536; genuinely transparent RGBA background. No text/labels/grid/floor/shadow/scene/aura/particles/glow.',
   'IMAGE1 is Wang Lin Pixel02 extracted from the CURRENT GAME, facing '+direction.toUpperCase()+'. This is PRIMARY anatomy, pixel treatment and CAMERA reference. Match its large chibi skull/head about half standing height, compact torso, short legs, broad low-resolution pixel clusters and palette density. Change identity to the NPC described below; never copy Wang long hair/clothes.',
   'IMAGE2 is the OWNER-APPROVED neutral identity of this SAME NPC in southeast, enlarged nearest8x. Preserve exact face/skull/hair/bun identity and costume/props, but rotate into the real requested view. IMAGE3 is the accepted southeast action sheet for the SAME NPC; use ONLY for action progression and identity continuity. DO NOT copy southeast facing from images2or3.',
   'Identity: '+npc.description,
   'MANDATORY camera for ALL18poses: '+facings[direction]+' Fixed orthographic isometric game camera exactly as image1. All rows and all action frames keep this camera/view. Never swivel toward southeast/front to make an action legible. Back views gesture seen from BEHIND; visible face detail depends on camera. No mirrored substitute. Clothing asymmetry/held objects remain on anatomical correct side when viewed from opposite directions.',
   'LAYOUT:6columns3rows, generous transparent gaps. All18 standing figures have EXACT SAME physical pixel scale and anatomy. Neutral hair-top to boot-bottom approximately240sourcepixels, bodywidth at most150sourcepixels; do NOT fill rowheight/cellheight. Keep generous top/bottom margins in every row, especially thirdrow. Equal head/skull dimensions and boot spread across rows; only drawn breath/arm/cloth changes. Full hands/boots/props always visible. Feet planted at each pose ground, NO stepping or root translation. Never shrink a gesture row to fit the canvas.',
   'ROW1 IDLE6:1 neutral calibration standing;2 slight inhalation;3 small shoulders/sleeves breath;4 calm exhalation;5 soft blink if eyes visible (back view no drawn eyes);6 EXACT SAME neutral as1. No whole-body bob/resize, no widening skull.',
   'ROW2 TALK6:1 exact neutral;2 slight mouth movement only if mouth visible and raising forearm;3 small calm explanatory palm in facing direction;4 hold gesture and natural second mouth shape if visible;5 retract forearm;6 exact neutral. Direction remains '+direction.toUpperCase()+'. Props attached to same hand/waist; no disappearing or changing sword hand.',
   'ROW3 PROFESSION6: '+npc.gesture+' Maintain requested '+direction.toUpperCase()+' view throughout. Gesture seen from this camera; never turn torso/face to southeast. Only arms/wrist/cloth change; all skull/torso/legs/boots retain same size as row1. Frame1and6 exact neutral matching row1frame1.',
   'Original NPC same game as Wang live. Crisp integer-style pixel clusters, no smooth detailed illustration to shrink. Human native nominal80worldpixels standing height; base64x96 foot32,88. Clip96x96 foot48,88 adds padding ONLY. Keep body, hand-held prop together for pilot; no FX/shadow. These are real18 motion poses, not one repeated static picture. New directions are review candidates; approval of southeast must not be claimed for them.'
  ].join('\n\n')+'\n';
  await writeFile(root+'/'+promptFile,prompt);
  const spec={assetType:'character-concept',name:'vn-npc-motion-'+id+'-v2',prompt,size:'1536x1536',quality:'high',n:1};
  await writeFile(root+'/specs/'+id+'.json',JSON.stringify(spec,null,2)+'\n');
  requests.push({id,slug:npc.slug,actorId:npc.id,direction,source,prompt:promptFile,images,inputHashes:await Promise.all(images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))}))),status:'planned-not-generated'});
 }
}
const actors=prior.actors.map(({id,slug,name,description,gesture})=>({id,slug,name,description,gesture}));
await writeFile(root+'/production-plan.json',JSON.stringify({schema:'npc-motion-eight-direction-plan-2',date:'2026-10-13',ownerContinuation:'tôi đồng ý',status:'seven-new-views-production',basis:'../van-hai-npc-motion-v1/approval.json',basisSha256:hash(await readFile(baseline+'/approval.json')),primaryStandard:standard+'/basis.json',primaryStandardSha256:hash(await readFile(standard+'/basis.json')),directions,actions:['idle','talk','profession'],actors,requests,canvas:[96,96],pivot:[48,88],neutralHeight:80,timings:{idle:{durationMs:1200,loop:true},talk:{durationMs:1200,loop:true},profession:{durationMs:1500,loop:false}},requiredClips:96,requiredPoses:576,newRequests:28,newClips:84,newPoses:504,artApproved:false,ownerApproved:false,runtimeImported:false},null,2)+'\n');
console.log('Prepared28 true direction source briefs. Approved Southeast retained by reference; no API call or runtime write.');
