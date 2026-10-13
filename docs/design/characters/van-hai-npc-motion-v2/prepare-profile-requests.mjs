import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2';
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const changes=[
 {id:'tran-duy-east',revision:2,identity:'raw/tran-duy-west.png',tag:'r2'},
 {id:'diep-tinh-east',revision:3,identity:'raw/diep-tinh-west-r2.png',tag:'r3'},
 {id:'ta-kiem-son-west',identity:'inputs/ta-kiem-son-approved-southeast-nearest8x.png',tag:'profile'},
 {id:'to-nhuoc-west',identity:'inputs/to-nhuoc-approved-southeast-nearest8x.png',tag:'profile'}
];
for(const edit of changes){
 const request=plan.requests.find(r=>r.id===edit.id),actor=plan.actors.find(a=>a.slug===request.slug);
 const source=edit.revision?'raw/'+edit.id+'-'+edit.tag+'.png':request.source;
 assert.notEqual(request.prompt,'prompts/'+edit.id+'-'+edit.tag+'.txt','Already prepared');
 await access(root+'/'+edit.identity);
 const toward=request.direction==='east'?'RIGHT':'LEFT';
 const prompt=[
  'Create18real pixel-sprite poses6columns3rows, transparent RGBA. PRIMARY IMAGE1 is liveWangLin '+request.direction.toUpperCase()+' camera/anatomy/pixel reference. Fixed actual '+toward+' SIDE PROFILE in EVERY pose. IMAGE2 supplies ONLY this SAME NPC identity/costume and its compact body; do not copy an opposite direction or southeastcamera. Draw true requestedside, no bitmapmirroring.',
  'Identity: '+actor.description,
  'CRITICAL PROFILE: rotate head sideward90degrees toward screen'+toward+'. ExactlyONE near eye/eyebrow when open, onlyONE closedeye whenblink. AbsolutelyNO far-eye/far eyebrow/tiny farside blackdot/whitecatchlight. Nose forms outermost side silhouette pointed'+toward+', cheek/nose side-plane, head side-facing, no broad frontal mask. Never draw two eyes or return a front3/4face. Keep torso/robes consistent with same-side cameraImage1. Hair/bun skull retains approvedNPCphysical size. This fixes previouslyobserved far-eye/front3/4leak.',
  'All18figures same physical size/skull/torso/legdimensions. Hairtop-to-bootbottom about240sourcepixels acrossallrows. Generous clear gutters above/below everyrow; do notstretch/shrinkrow3 tofillspace. Fullhands/boots/heldprops visible, plantedfeet, no world translation. Coarse pixelclusters and3tone materialpalette matchingimage1; no painterlysmoothedillustration.',
  'Row1IDLE6: neutral calibration -> gentleinhale -> subtle shoulder/sleevebreath -> exhale -> one-eyeblink -> EXACTneutral. No head/bodyresizing.',
  'Row2TALK6: neutral -> forearm lifts with slightmouthchange ifvisible -> calmopenpalm -> hold+mouthchange -> retract -> EXACTneutral. Face remains strict'+toward+'PROFILE. Prop remains in its own fixedanatomicalhand or waist; no disappearance/hand-switch.',
  'Row3PROFESSION6: '+actor.gesture+' All6poses maintain strict'+toward+'profile. Forearms may move, skull/legs/boots retain identicalsize, neutral1and6 matchrow1neutral. Occlude hands/props withtorso wherecamera demands; never paintbody-back hand as front gesture.',
  'Humanbase64x96 standing80worldpixels foot32,88. Clip96x96 foot48,88 ispaddingonly. No text/grid/floor/shadow/glow/FX. Outputsquare1536x1536 requested; actualdimensionsmaydiffer but keep18poses6x3. These newdirections remaincandidates, do not claimapprovedART.'
 ].join('\n\n')+'\n';
 const promptFile='prompts/'+edit.id+'-'+edit.tag+'.txt',assetPlan='plans/'+edit.id+'-'+edit.tag+'.json',specFile='specs/'+edit.id+'-'+edit.tag+'.json';
 await writeFile(root+'/'+promptFile,prompt);
 await writeFile(root+'/'+specFile,JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-'+edit.id+'-v2-'+edit.tag,prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
 if(edit.revision){
  const oldSource=request.source;
  request.sourceRevisions??=[];request.sourceRevisions.push({source:oldSource,sha256:hash(await readFile(root+'/'+oldSource)),status:'superseded-needs-source-correction',reason:'Far eye/eyebrow in actual EAST sheet; true side-profile requires only one visible eye.'});
  request.revision=edit.revision;
 }
 request.source=source;request.prompt=promptFile;request.assetPlan=assetPlan;request.spec=specFile;
 request.images=['inputs/wang-lin-live-'+request.direction+'-nearest8x.png',edit.identity];
 request.inputHashes=await Promise.all(request.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
 request.status='profile-camera-source-planned';
}
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');console.log('Prepared four profile requests; existing source revisions preserved; no paid call.');
