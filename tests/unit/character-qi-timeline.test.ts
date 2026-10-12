import {test} from 'node:test';import assert from 'node:assert/strict';
import {createQiChannel,beginQiChannel,releaseQiChannel,readQiTimeline} from '../../client/src/core/character-qi-timeline';
test('quiet/gather/release returns to quiet without changing the body contract',()=>{
 for(const theme of ['sinhTu','huyenTu'] as const){const start=beginQiChannel(100);assert.equal(readQiTimeline(100,theme,start).charge,0);assert.equal(readQiTimeline(2100,theme,start).charge,1);const released=releaseQiChannel(start,2100,theme);assert.equal(readQiTimeline(2200,theme,released).phase,'release');assert.equal(readQiTimeline(4000,theme,released).phase,'quiet');assert.equal(readQiTimeline(4000,theme,released).burst.opacity,0);assert.equal(readQiTimeline(4000,theme,released).charge,0);}
});
test('tap produces bounded feedback; repeated/long holds cannot accumulate',()=>{
 const state=releaseQiChannel(beginQiChannel(100),101,'sinhTu');assert.equal(state.strength,.2);assert.equal(releaseQiChannel(state,120,'sinhTu'),state);const long=releaseQiChannel(beginQiChannel(0),1e6,'huyenTu');assert.equal(long.strength,1);
 for(let now=0;now<8000;now+=97)for(const theme of ['sinhTu','huyenTu'] as const){const d=readQiTimeline(now,theme,createQiChannel());assert.ok(d.rear.every(v=>v.opacity>=0&&v.opacity<=1));assert.ok(d.motes.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.opacity>=0&&v.opacity<=1));}
});
test('motes follow a continuous ellipse and preserve front/back order',()=>{
 const before=readQiTimeline(1000,'sinhTu'),after=readQiTimeline(1001,'sinhTu');for(let i=0;i<3;i++){assert.ok(Math.hypot(after.motes[i].x-before.motes[i].x,after.motes[i].y-before.motes[i].y)<.05);assert.equal(before.motes[i].front,before.motes[i].y>=0);}assert.notDeepEqual(readQiTimeline(1000,'sinhTu'),readQiTimeline(1000,'huyenTu'));
});
