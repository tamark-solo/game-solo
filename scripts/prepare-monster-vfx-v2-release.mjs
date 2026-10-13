import fs from 'node:fs';
const root='docs/design/vfx/van-hai-monster-vfx-v2',p=JSON.parse(fs.readFileSync(root+'/production-plan.json','utf8'));
if(fs.existsSync(root+'/release-jobs.json'))throw Error('Resume existing release jobs; do not overwrite selected prompts.');
const jobs=p.jobs.map(j=>{
 const id=j.id+'-release',design=j.description.match(/Release: ([\s\S]+?) Impact:/)?.[1]??j.description;
 const prompt=`Transparent original game VFX flipbook for pixel-chibi cultivation MMORPG. Reference image is PALETTE inspiration only, NEVER draw actor. SIX frames in a THREE COLUMN x TWO ROW layout (3x2), reading top-left, top-middle, top-right, bottom-left, bottom-middle, bottom-right. This is one RELEASE sequence, not charge or contact. ${design} ${j.id==='spirit-fungus'?'Radial expanding ring at cell center.':'Horizontal RIGHTWARD energy shape; emitter at CELL CENTER, no diagonals.'} Frame1 ignition, frame2 acceleration, frame3 peak, frame4 follow-through, frame5 broken shapes, frame6 ONLY sparse remnants. Preserve effect identity and origin across frames. CRITICAL: maximum width of even the biggest peak = 55% of one cell; maximum height=45%. Leave at least 20% transparent margin EVERY SIDE of EVERY CELL. Clearly separate all six poses with wide empty alpha corridors, absolutely no particle/edge/ribbon crosses a corridor or touches neighbor. Center at (column+.5)/3,(row+.5)/2. No full-sheet glow or low-alpha haze; compact falloff only. Chunky pixel-shaped cores, dark opaque contrasting contour and high-contrast bright ivory highlights, palette ${j.palette.light} with dark ${j.palette.dark}. Strong readable silhouette at ${j.phases[1].width}px native width. All disconnected shards stay within their cell. Actual transparent RGBA, no black/colored/checkerboard background, labels, text, grid lines, UI, body, weapon or shadow.`;
 const promptPath='prompts/'+id+'.txt';fs.writeFileSync(root+'/'+promptPath,prompt+'\n');
 j.releaseSource='sources/'+id+'.png';j.releasePrompt=promptPath;
 return {id,actor:j.actor,rank:j.rank,prompt:promptPath,promptText:prompt,source:j.releaseSource,references:j.references,type:'release-six-3x2'};
});
fs.writeFileSync(root+'/production-plan.json',JSON.stringify(p,null,2)+'\n');
fs.writeFileSync(root+'/release-jobs.json',JSON.stringify(jobs.map(({promptText,...j})=>j),null,2)+'\n');
console.log(JSON.stringify(jobs));
