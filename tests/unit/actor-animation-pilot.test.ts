import test from 'node:test';
import assert from 'node:assert/strict';
import {pilotSample,pilotFrameAge,pilotClip,type PilotClip,type PilotCatalog} from '../../client/src/core/actor-animation-pilot';
const clip={fps:24,durations:[2,4,2],loop:false,frames:[{file:'prepare'},{file:'release'},{file:'settle'}],phases:[{at:0,label:'Prepare'},{at:250,label:'Recovery'}]} as PilotClip;
test('variable holds use absolute age and exact frame boundaries; late one-shots stay terminal',()=>{
 assert.equal(pilotSample(clip,83.332).index,0);assert.equal(pilotSample(clip,83.334).index,1);assert.equal(pilotSample(clip,250).index,2);assert.equal(pilotSample(clip,250).phase,'Recovery');
 assert.equal(pilotSample(clip,10000).index,2);assert.equal(pilotSample(clip,10000).complete,true);assert.equal(pilotFrameAge(clip,1),2000/24);
});
test('looping clips preserve age through wraps while static single-pose and invalid input are explicit',()=>{
 const looping={...clip,loop:true};assert.equal(pilotSample(looping,1000/3+1).index,0);assert.equal(pilotSample(looping,1000/3+1).complete,false);
 assert.equal(pilotSample({...clip,durations:[1],frames:[clip.frames[0]],loop:true},Infinity).index,0);
 assert.throws(()=>pilotSample({...clip,durations:[1]},0),/Invalid/);
});
test('missing directional binding fails rather than mirroring or silently using a different body',()=>{
 assert.throws(()=>pilotClip({clips:{}} as PilotCatalog,'wang','death','east'),/Unavailable/);
});
