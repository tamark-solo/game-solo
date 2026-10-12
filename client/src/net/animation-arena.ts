import {Client,type Room} from '@colyseus/sdk';
import {ANIMATION_ARENA_ROOM,type ArenaCommand,type ArenaEvent,type ArenaResult,type ArenaSnapshot} from '@shared/animation-arena/contracts';
export class AnimationArenaSession {
 private room?:Room;private seq=0;private round=0;private request=0;
 constructor(private snapshot:(s:ArenaSnapshot)=>void,private event:(e:ArenaEvent)=>void,private result:(r:ArenaResult)=>void,private left:()=>void){}
 async connect(){const room=await new Client(import.meta.env.VITE_ANIMATION_ARENA_URL??'ws://127.0.0.1:2674').create(ANIMATION_ARENA_ROOM);this.room=room;
  room.onMessage('snapshot',(s:ArenaSnapshot)=>{if(s.round!==this.round){this.round=s.round;this.seq=0;}this.snapshot(s);});
  room.onMessage('skill',(e:ArenaEvent)=>this.event(e));room.onMessage('result',(r:ArenaResult)=>this.result(r));room.onLeave(()=>{this.room=undefined;this.left();});
 }
 input(x:number,y:number,run:boolean){if(!this.room||!this.round)return;this.room.send('input',{round:this.round,seq:++this.seq,x,y,run});}
 cast(skill:string,aimX:number,aimY:number,targetId:string,x:number,y:number,run:boolean){if(!this.room||!this.round)return;this.input(x,y,run);const c:ArenaCommand={round:this.round,id:'c'+(++this.request),inputSeq:this.seq,skill,aimX,aimY,targetId};this.room.send('command',c);}
 ai(value:boolean){this.room?.send('ai',value);}
 reset(){this.room?.send('reset');}
 stop(){this.room?.send('stop');}
 dispose(){const room=this.room;this.room=undefined;void room?.leave();}
}
