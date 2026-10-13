import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2',id='tran-duy-east',hash=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8')),q=plan.requests.find(r=>r.id===id);
assert.equal(q.revision,2,'Expected rejected second EAST source');
const previous=q.source;
const prompt=[
 'Targeted IDENTITY correction on an existing18pose sprite sheet. Image1 is ONLY the PRIMARY WangLin live EAST camera/pixel anatomy standard. DO NOT COPY HIS IDENTITY: NO WangLin longhair/ponytail, no charcoal/greyblack clothing. Image2 is current EAST sheet: its RIGHT SIDE ONE-EYE CAMERA is correct but identity is WRONG. EDIT IMAGE2, preserving that side-facing camera and18pose layout. Image3 is owner-approved TranDuy NPC identity neutral. Image4 is sameTranDuy WEST sheet showing correct compactbun/robe; identityonly, do not faceWEST.',
 'Change ALL18poses to exactTranDuy: middle-agedmale shortmoustache/goatee, COMPACT DARK TOPBUN with GREY SIDE STREAK and smallbronze/jadehairtie. REMOVE ALL LONG HAIR OR PONYTAIL behindhead/back. Backhair ends at nape, compactskull/neck silhouette. IVORY LIGHT GREY ROBE with thin BRONZE EDGING, waistCELADON JADETOKEN and BROWN SECT-TAG POUCH, shortdarkboots. NO giantWanglonghair mass, NO black/darkcharcoal mainrobe/sash takingover costume. Sameidentity asimage3 and4.',
 'Preserve TRUE RIGHTSIDE PROFILE, nose outside silhouette pointsRIGHT, EXACTLYONE NEAR EYE/eyebrow whenopen. No far-eye/far-eyebrow/tinyfarblackdot, no front3/4face. Blink onlynear eye. Never inheritfrontSEface fromimage3 orleftcamera fromimage4. All18faces maintain correctEASTcameraimage1and2.',
 'Keep samepixelclusters/physical scale/skull/body/boots across3rows. Image2same18poses6cols3rows: row1idle neutral/breathe/exhale/blink/neutral; row2talkneutral/raiseforearm/openpalm/hold/retract/neutral; row3guidegesture neutral/raiseforearm/directionpalm/hold/retract/neutral. Bodyheight240sourcepixels nominal, native80; no rowresizing. Fullhands/props/boots, largecleartransparentgaps. Humanbase64x96 foot32,88, clip96x96foot48,88paddingonly.',
 'Transparent RGBA, nofloor/shadow/text/grid/FX/glow. This is one NPCTranDuy, notWangLin. Preservecamera and fixidentity ONLY; newrevisioncandidate.'
].join('\n\n')+'\n';
q.sourceRevisions.push({source:previous,sha256:hash(await readFile(root+'/'+previous)),status:'superseded-needs-source-correction',reason:'EAST view correct one-eye but copied Wang Lin long hair and charcoal clothing; restore approved Tran Duy identity.'});
q.revision=3;q.source='raw/'+id+'-r3.png';q.prompt='prompts/'+id+'-r3.txt';q.assetPlan='plans/'+id+'-r3.json';q.spec='specs/'+id+'-r3.json';q.status='guide-east-identity-correction-planned';
q.images=['inputs/wang-lin-live-east-nearest8x.png',previous,'inputs/tran-duy-approved-southeast-nearest8x.png','raw/tran-duy-west.png'];
q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
await writeFile(root+'/'+q.prompt,prompt);await writeFile(root+'/'+q.spec,JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-'+id+'-v2-r3',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');console.log('Prepared guide EAST identity correction; no API call.');
