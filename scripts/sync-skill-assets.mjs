import { readFile, writeFile, mkdir, copyFile, readdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, basename } from 'node:path';

// Package authored art and declarative presentation. Never generate art during web build.
const output=resolve('client/public/assets/r01');await mkdir(output,{recursive:true});
const clips={},sources=[],skills={};
const folders={sword:'frame-by-frame-r01',thunder:'r01-thunder-v1',wind:'r01-wind-v1'};
const ms=(frame,fps)=>(frame-1)*1000/fps;
const length=c=>c.durations.reduce((s,v)=>s+v,0)*1000/c.fps;
const track=(id,clip,trigger,delay,duration,anchor,layer,extra={})=>({id,clip,trigger,delay,duration,anchor,layer,...extra});
async function copyClips(root,data){
  for(const [id,c] of Object.entries(data.clips)){
    const atlas=await readFile(resolve(root,c.atlas)),sha256=createHash('sha256').update(atlas).digest('hex');
    const file=`${id}-${sha256.slice(0,16)}-${basename(c.atlas)}`;await copyFile(resolve(root,c.atlas),resolve(output,file));
    clips[id]={fps:c.fps,frameSize:c.frameSize,anchor:c.anchor,sampling:c.sampling||'nearest',loop:c.loop,
      durations:c.durations,atlasSize:c.atlasSize,atlasUrl:`/assets/r01/${file}`,frames:c.frames.map(f=>f.rect??f),sha256,bytes:atlas.length,
      ...(c.sockets?{sockets:c.sockets}:{}),...(c.frameCrops?{frameCrops:c.frameCrops}:{}),...(c.frameCutouts?{frameCutouts:c.frameCutouts}:{})};
  }
}
for(const [id,folder] of Object.entries(folders)){
  const root=resolve('docs/design/vfx',folder),raw=await readFile(resolve(root,'clips.json')),skillRaw=await readFile(resolve(root,'skill.json'));
  for(const [file,bytes] of [['clips.json',raw],['skill.json',skillRaw]])sources.push({path:`docs/design/vfx/${folder}/${file}`,sha256:createHash('sha256').update(bytes).digest('hex')});
  const data=JSON.parse(raw),skill=JSON.parse(skillRaw);await copyClips(root,data);
  clips[skill.character.clip].sockets=skill.sockets;
  skills[id]={fps:skill.fps,characterEnd:ms(skill.events.find(e=>e.type==='character.end').frame,skill.fps),
    bindings:{'CHR-WANG-LIN-CHIBI':{east:skill.character.clip}},tracks:[]};
  for(const t of skill.tracks.filter(t=>t.startFrame&&t.clip!==skill.character.clip)){
    const anchor=t.anchor==='character.castSocket'||t.anchor==='hand'?'hand':t.anchor==='target.ground'?'target':t.anchor==='body'?'body':'origin';
    const layer=t.layer==='air'||t.layer===2?'air':'ground';
    skills[id].tracks.push(track(t.id??t.clip,t.clip,'cast',ms(t.startFrame,skill.fps),
      t.stopOnArrival||t.holdLastUntilResolve?8000:t.stopBeforeFrame?ms(t.stopBeforeFrame-t.startFrame+1,skill.fps):length(clips[t.clip]),anchor,layer,
      {stopOn:[...(t.stopOnArrival?['arrival']:[]),'cancel'],
        ...(t.holdLastUntilResolve?{holdLastUntilResolve:true,resolveOn:['hit','miss']}:{}),...(t.clip==='wind-trail'?{rotate:true}:{})}));
  }
  if(id==='sword'){
    skills[id].projectileClip='sword-projectile';
    skills[id].tracks.push(track('impact','qi-impact','hit',0,length(clips['qi-impact']),'hit','impact',{rotate:true,projectileAnchor:true}));
    // The approved preview reuses impact frames 009–012 for a miss, without a new atlas.
    skills[id].tracks.push(track('miss-dissolve','qi-impact','miss',0,4*1000/skill.fps,'hit','air',
      {rotate:true,projectileAnchor:true,frameStart:8,frameCount:4}));
  }
  if(id==='thunder'){
    skills[id].tracks.push(track('bolt','thunder-bolt','hit',0,length(clips['thunder-bolt']),'hit','air'));
    skills[id].tracks.push(track('impact','thunder-impact','hit',skill.presentation.strikeLeadFrames*1000/skill.fps,length(clips['thunder-impact']),'hit','impact'));
  }
  if(id==='wind'){
    skills[id].tracks.push(track('arrival','wind-arrival','arrival',0,length(clips['wind-arrival']),'hit','air'));
    skills[id].ghosts={lagMs:skill.presentation.ghosts.sampleLagFrames.map(f=>f*1000/skill.fps),opacity:skill.presentation.ghosts.opacity};
  }
}
const castRoot=resolve('docs/design/characters/core-cast-v1');
let castRaw;try{castRaw=await readFile(resolve(castRoot,'clips.json'));}catch(error){if(error.code!=='ENOENT')throw error;}
if(castRaw){
  const data=JSON.parse(castRaw);await copyClips(castRoot,data);
  sources.push({path:'docs/design/characters/core-cast-v1/clips.json',sha256:createHash('sha256').update(castRaw).digest('hex')});
  for(const [id,binding] of Object.entries(data.bindings))for(const [actor,directions] of Object.entries(binding)){
    skills[id].bindings[actor]??={};
    for(const [direction,clip] of Object.entries(directions)){
      // The owner-approved original Wang Lin east sequences keep priority.
      if(actor==='CHR-WANG-LIN-CHIBI'&&direction==='east')continue;
      skills[id].bindings[actor][direction]=clip;
    }
  }
}
await writeFile(resolve(output,'clips.json'),JSON.stringify({version:2,skills,clips,sources},null,2)+'\n');
// Prune only generated, hash-named outputs of known clips inside this output directory.
const current=new Set(Object.values(clips).map(c=>basename(c.atlasUrl)));
for(const file of await readdir(output)){
  if(current.has(file))continue;
  if(Object.keys(clips).some(id=>file.startsWith(id+'-')&&/^[a-f0-9]{16}-/.test(file.slice(id.length+1))))await unlink(resolve(output,file));
}
console.log(`Skill presentation: ${Object.keys(clips).length} authored atlases, ${Object.values(clips).reduce((s,c)=>s+c.bytes,0)} bytes; actor atlases loaded on demand.`);
