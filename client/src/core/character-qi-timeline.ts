import type {CharacterQiTheme} from './character-qi-review';
export interface QiChannel{startedAt:number|null;releasedAt:number|null;strength:number}
export const createQiChannel=():QiChannel=>({startedAt:null,releasedAt:null,strength:0});
const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const timing=(theme:CharacterQiTheme)=>theme==='sinhTu'?{charge:1600,release:1100,cycle:4800}:{charge:1100,release:850,cycle:3100};
export function beginQiChannel(now:number):QiChannel{return {startedAt:Math.max(0,now),releasedAt:null,strength:0};}
export function releaseQiChannel(state:QiChannel,now:number,theme:CharacterQiTheme):QiChannel{
 if(state.startedAt===null)return state;
 return {startedAt:null,releasedAt:now,strength:Math.max(.2,clamp((now-state.startedAt)/timing(theme).charge))};
}
// Absolute presentation time only. No player stats, cast command or simulation state.
export function readQiTimeline(now:number,theme:CharacterQiTheme,state:QiChannel=createQiChannel()){
 const t=timing(theme),age=Math.max(0,Number.isFinite(now)?now:0),charge=state.startedAt===null?0:smooth((age-state.startedAt)/t.charge),releaseAge=state.releasedAt===null?Infinity:Math.max(0,age-state.releasedAt),releasing=releaseAge<t.release,progress=clamp(releaseAge/t.release),energy=releasing?state.strength*Math.sin(Math.PI*progress):0;
 const phase=state.startedAt!==null?'gather':releasing?'release':'quiet',ma=theme==='huyenTu',breath=(1-Math.cos(age/t.cycle*Math.PI*2))/2;
 const rear=[0,.5].map(offset=>{const p=(age/t.cycle+offset)%1,flow=Math.sin(Math.PI*p)**2;return {opacity:(ma?.13:.09)*flow+charge*.48*flow+energy*.55*flow,dy:3-7*p,scaleX:.87+charge*.12+energy*.12,scaleY:.74+charge*.25+energy*.13};});
 const motes=[0,1,2].map(i=>{const angle=age/(ma?3800:6800)*Math.PI*2*(ma?-1:1)+i*Math.PI*2/3,radius=36*(1-charge*.72)+energy*20,y=Math.sin(angle)*9;return {x:Math.cos(angle)*radius,y,opacity:.3+charge*.6+energy*.4,front:y>=0};});
 return {phase,charge,energy,ground:{scale:.88+breath*.035-charge*.07+energy*.13,opacity:.35+breath*.12+charge*.4+energy*.3},rear,front:{opacity:.10+charge*.23+energy*.26,dx:Math.sin(age/(ma?650:1500))*2,dy:-charge*1.5,scaleX:.92+charge*.1+energy*.14},motes,burst:{scale:1+smooth(progress)*.7,opacity:releasing?state.strength*(1-progress)**2*.8:0}};
}
