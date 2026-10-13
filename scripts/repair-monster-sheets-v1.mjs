import fs from 'node:fs';
const root='docs/design/characters/van-hai-monster-animation-v1';
const plan=JSON.parse(fs.readFileSync(root+'/production-plan.json','utf8'));
const ids=process.argv.find(v=>v.startsWith('--ids='))?.slice(6).split(',')??['dark-talisman-rogue-south','quiet-wisp-southwest'];
for(const id of ids){
 const j=plan.jobs.find(j=>j.id===id),old=fs.readFileSync(root+'/'+j.prompt,'utf8');
 const extra='CRITICAL SHEET COUNT: exactly 36 bodies in SIX rows and SIX columns. Row centers at 8%,25%,42%,58%,75%,92% of image height. Row1 NEUTRAL x6, Row2 IDLE x6, Row3 MOVE x6, Row4 ATTACK x6, Row5 HIT x6, Row6 DEATH x6. Do not omit MOVE, do not merge neutral and idle. Put the same planted root floor at the bottom 82% of each tile. Body occupies only 60% of tile height, leave large fully transparent gaps; no touching or bridging to other cells. ';
 fs.writeFileSync(root+'/'+j.prompt,extra+(id.startsWith('quiet')?'Keep core and three ink ribbons as one physically joined silhouette with thin opaque ink links. No detached floating fragments in body; loose dust is VFX elsewhere. ':'')+old);
 j.references=[j.references[0]];
 for(const folder of ['sources','generation'])fs.mkdirSync(root+'/'+folder+'/rejected',{recursive:true});
 for(const [from,to]of [[root+'/'+j.source,root+'/sources/rejected/'+id+'-v1.png'],[root+'/generation/'+id+'.json',root+'/generation/rejected/'+id+'-v1.json']])if(fs.existsSync(from)&&!fs.existsSync(to))fs.renameSync(from,to);
}
fs.writeFileSync(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');
console.log({retainedAndQueued:ids});
