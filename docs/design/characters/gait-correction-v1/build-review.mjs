import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const definitions=[
  {id:'male',name:'Đệ tử nam',legacy:'../player-avatars-v2/male/native-v2',next:'male/native-v1'},
  {id:'female',name:'Đệ tử nữ',legacy:'../player-avatars-v2/female/native-v2',next:'female/native-v1'},
  {id:'wang-lin',name:'Vương Lâm',legacy:'../wang-lin-gray-walk-v1/native-v2',next:'wang-lin/native-v1'},
];
const actors=[];
for(const d of definitions){
  actors.push({...d,legacyMeta:JSON.parse(await readFile(resolve(root,d.legacy,'atlas.json'),'utf8')),nextMeta:JSON.parse(await readFile(resolve(root,d.next,'atlas.json'),'utf8'))});
}
const reviewStatus=actors.some(a=>a.nextMeta.animationStatus==='gait_redraw_changes_requested')?'changes_requested_after_chibi_reference':'pending_owner_motion_review';
await writeFile(resolve(root,'review-data.js'),`window.GaitReviewData = ${JSON.stringify({actors,reviewStatus},null,2)};\n`,'utf8');
console.log(`Built review for ${actors.length} actors. Artwork review: ${reviewStatus}.`);
