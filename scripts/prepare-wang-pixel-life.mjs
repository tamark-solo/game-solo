import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sharp} from './actor-sprite-tools.mjs';
const root='docs/design/characters/wang-lin-pixel-life-v1',base='docs/design/characters/wang-lin-pixel-production-v2';
try{await readFile(root+'/production-plan.json');throw Error('Pack already prepared; create a new version instead.');}catch(e){if(e.code!=='ENOENT')throw e;}
const sha=b=>createHash('sha256').update(b).digest('hex');
const dirs=['south','southwest','west','northwest','north','northeast','east','southeast'];
const facings=['straight FRONT, BOTH eyes, centered nose','FRONT LEFT three-quarter','LEFT profile','BACK LEFT three-quarter','straight BACK, NO eyes/face/nose','BACK RIGHT three-quarter','RIGHT profile','FRONT RIGHT three-quarter'];
await mkdir(root+'/inputs',{recursive:true});await mkdir(root+'/sources',{recursive:true});
const requests=[];
for(const [i,d] of dirs.entries()){
 const input=`inputs/master-${d}.png`;await sharp(await readFile(base+'/masters/'+d+'.png')).resize(512,768,{kernel:'nearest'}).png().toFile(root+'/'+input);
 const prompt=`Create a production game sprite animation sheet, 6 columns x 3 rows, 18 isolated FULL BODY poses on a truly transparent background. Reference is the accepted Wang Lin pixel chibi identity. EXACT same skull/head size, hair/topknot, face, slim torso, short grey ivory robes, dark trousers/boots, charcoal sash and grey jade palette. Fixed isometric orthographic camera, ${d.toUpperCase()} (${facings[i]}) in EVERY pose. Never mirror or rotate into another view during action. Sharp pixel clusters; no glow, aura, particles, shadow, weapon or accessory. No text, labels, grid or scenery. Generous transparent separation. All poses have SAME anatomy/physical scale as reference; lowering body is natural, do not enlarge sitting head or shrink gathering person. Row 1: six identical standing neutral calibration poses, boots on same ground baseline. Row 2: six seated cross-legged MEDITATION loop poses: straight calm spine, hands on knees/palms inward, eyes relaxed, subtle breath and cloth changes, hair/topknot still same physical dimensions. Natural seated height about 55 percent standing height, lower point is pelvis/folded legs on ground. Row 3: six GATHER poses: neutral -> knees bend -> crouch leaning forward gently -> leading hand touches low ground in facing direction -> brings hand inward -> stands back to EXACT neutral. Feet remain planted, NO stepping or large displacement. Full hands, hair, robes and boots visible. Maintain consistent column centers and ground baseline for each row. Source standing figures around 200 pixels tall; each cell fits whole body with clear margins. Original character, preserve only our referenced identity.`;
 await writeFile(root+`/sources/${d}.prompt.txt`,prompt+'\n');requests.push({direction:d,input,prompt,source:`sources/${d}.png`,inputSha256:sha(await readFile(root+'/'+input))});
}
await copyFile('docs/design/characters/actor-animation-standard-v2/approval.json',root+'/basis.json');
await writeFile(root+'/production-plan.json',JSON.stringify({version:1,tool:'built-in ImageGen',ownerApproved:false,artApproved:false,directions:dirs,actions:['meditate','gather'],requests},null,2)+'\n');
console.log('Prepared eight real life-action views; immutable player basis retained.');
