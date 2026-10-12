import {Room,Server} from 'colyseus';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {Schema} from '@colyseus/schema';
import {AnimationArena} from '@shared/animation-arena/model';
import {ANIMATION_ARENA_ROOM} from '@shared/animation-arena/contracts';

// Separate loopback service. Importing live server/index or persistence here is prohibited.
class AnimationRoom extends Room<{state:Schema}>{
 state=new Schema();maxClients=1;maxMessagesPerSecond=80;private arena!:AnimationArena;private resetAt=0;
 onCreate(){this.arena=new AnimationArena(Date.now(),(round,event)=>this.broadcast('skill',{round,event}));
  this.onMessage('input',(_client,data)=>this.arena.inputCommand(data));
  this.onMessage('command',(client,data)=>{client.send('result',this.arena.command(data));this.broadcast('snapshot',this.arena.snapshot());});
  this.onMessage('ai',(_client,data)=>{if(typeof data==='boolean')this.arena.setAI(data);});
  this.onMessage('reset',()=>{if(Date.now()-this.resetAt<1000)return;this.resetAt=Date.now();this.arena.reset();this.broadcast('snapshot',this.arena.snapshot());});
  this.onMessage('stop',()=>this.arena.stop());
  this.setSimulationInterval(dt=>{this.arena.tick(dt/1000);this.broadcast('snapshot',this.arena.snapshot());},1000/30);
 }
 onJoin(){this.broadcast('snapshot',this.arena.snapshot());}
 onLeave(){this.arena.stop();}
}
const port=Number(process.env.ANIMATION_ARENA_PORT??2674);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid fixture port');
const server=new Server({transport:new WebSocketTransport(),express:app=>{app.get('/health',(_req,res)=>res.json({ok:true,fixture:'actor-animation',persistent:false}));}});server.define(ANIMATION_ARENA_ROOM,AnimationRoom);await server.listen(port,'127.0.0.1');console.log(`Backend preview: http://127.0.0.1:${port} · ephemeral rooms · no owner DB writes`);
