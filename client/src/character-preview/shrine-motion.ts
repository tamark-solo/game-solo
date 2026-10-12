import type { AvatarId } from '../../../shared/profiles';

interface Frame { x:number; y:number; w:number; h:number }
interface CultivationSource { image:HTMLImageElement; frames:Frame[]; fps:number }
interface StandingSource { image:HTMLImageElement; frame:Frame }

// UI-only body pose shared by preview and live profile. Reads author atlases; never owns gameplay,
// cast, save, transport or a cultivation timer. Anchor stays (48,88) / (32,88).
export class ShrineMotion {
  readonly standing=new Map<AvatarId,StandingSource>();
  readonly cultivation=new Map<AvatarId,CultivationSource>();
  private media=matchMedia('(prefers-reduced-motion: reduce)');
  private frameIndex=0;
  private raf=0;
  private epoch=performance.now();
  private pose=false;
  private online=true;
  private reducedOverride=false;
  private abort=new AbortController();
  constructor(private host:HTMLElement,private avatar:()=>AvatarId,private canvas:()=>HTMLCanvasElement|null){
    document.addEventListener('visibilitychange',()=>this.refresh(),{signal:this.abort.signal});
    this.media.addEventListener('change',()=>this.refresh(),{signal:this.abort.signal});
  }
  get snapshot(){return {pose:this.pose,index:this.frameIndex,moving:!!this.raf,cultivationReady:this.cultivation.size};}
  setReduced(reduced:boolean){if(this.reducedOverride===reduced)return;this.reducedOverride=reduced;this.refresh();}
  setState(pose:boolean,online:boolean){
    if(pose!==this.pose)this.epoch=performance.now();
    this.pose=pose;this.online=online;this.refresh();
  }
  refresh(){
    cancelAnimationFrame(this.raf);this.raf=0;
    if(this.abort.signal.aborted)return;
    const visible=!this.host.hidden&&!document.hidden;
    const reduced=this.media.matches||this.reducedOverride;
    const moving=visible&&this.online&&!reduced;
    this.host.dataset.qiMotion=moving?'full':'still';
    this.host.dataset.pose=this.pose?'cultivation':'standing';
    this.frameIndex=this.pose&&reduced?2:0;
    this.paint();
    if(this.pose&&moving)this.raf=requestAnimationFrame(this.tick);
  }
  pause(){cancelAnimationFrame(this.raf);this.raf=0;this.host.dataset.qiMotion='still';}
  paint(){
    const canvas=this.canvas();if(!canvas)return;
    const ctx=canvas.getContext('2d')!;ctx.clearRect(0,0,192,192);ctx.imageSmoothingEnabled=false;
    const active=this.pose?this.cultivation.get(this.avatar()):undefined;
    if(active){const f=active.frames[this.frameIndex%active.frames.length];ctx.drawImage(active.image,f.x,f.y,f.w,f.h,0,0,192,192);}
    else{const standing=this.standing.get(this.avatar());if(standing){const f=standing.frame;ctx.drawImage(standing.image,f.x,f.y,f.w,f.h,32,0,128,192);}}
  }
  private tick=(now:number)=>{
    const source=this.cultivation.get(this.avatar());
    const index=source?Math.floor((now-this.epoch)/1000*source.fps)%source.frames.length:0;
    if(index!==this.frameIndex){this.frameIndex=index;this.paint();}
    this.raf=requestAnimationFrame(this.tick);
  };
  dispose(){cancelAnimationFrame(this.raf);this.raf=0;this.abort.abort();}
}
