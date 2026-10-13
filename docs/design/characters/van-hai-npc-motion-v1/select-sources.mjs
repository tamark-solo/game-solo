import {readFile,writeFile} from 'node:fs/promises';
const root='docs/design/characters/van-hai-npc-motion-v1';
try{await readFile(root+'/approval.json');throw Error('Owner-approved baseline: select sources in a new version instead.');}catch(e){if(e.code!=='ENOENT')throw e;}
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
const actor=plan.actors.find(a=>a.slug==='diep-tinh');
actor.source='raw/diep-tinh-southeast-r3.png';
actor.prompt='prompts/diep-tinh-southeast-r3.txt';
actor.images=['inputs/wang-lin-live-southeast-nearest8x.png','inputs/diep-tinh-identity-nearest8x.png','raw/diep-tinh-southeast-r2.png'];
actor.sourceRevisions=[
 {source:'raw/diep-tinh-southeast.png',status:'superseded-pilot',reason:'Profession row about6 native pixels shorter than idle; preserved for provenance.'},
 {source:'raw/diep-tinh-southeast-r2.png',status:'superseded-pilot',reason:'Profession row about4 native pixels shorter than idle; preserved for provenance.'},
 {source:actor.source,status:'selected-motion-pilot',reason:'Idle/talk dimensions closer; profession row still about3 native pixels shorter, requires owner visual review.'}
];
plan.visualLimitations={
 'tran-duy':'Pixel anatomy and face can vary slightly across generated frames; review loop and transitions at native1x.',
 'diep-tinh':'Profession body about3 native pixels shorter than idle. Older identity remains softened; no per-pose resize has been used to hide variation.',
 'ta-kiem-son':'Profession row about1-2 native pixels shorter; wooden sword briefly changes hand/occlusion in talk. Prop continuity needs visual review.',
 'to-nhuoc':'Profession row about1-2 native pixels shorter; brush is small at native scale and the sealed case changes silhouette slightly.'
};
plan.artApproved=false;plan.ownerApproved=false;plan.runtimeImplemented=false;
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');
console.log('Selected final pilot sources; all revisions preserved; visual limitations explicit.');
