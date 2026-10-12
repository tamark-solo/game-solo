// Original procedural cue recipe for ART review; enabled only by a user click.
export class BasicReviewAudio {
 constructor(){this.context=null;this.enabled=false;this.heard=new Set();this.voices=new Set();this.played=0;}
 async enable(on){this.enabled=on;if(!on){this.stop();return;}const Context=window.AudioContext||window.webkitAudioContext;if(!Context){this.enabled=false;return;}this.context??=new Context();await this.context.resume();}
 consume(events,now,allowed){if(!allowed||!this.enabled||this.context?.state!=='running')return;for(const e of events){const key=e.strikeId+':'+e.type,age=now-e.at;if(age<0||age>70||this.heard.has(key))continue;this.heard.add(key);while(this.heard.size>128)this.heard.delete(this.heard.values().next().value);this.cue(e.type,e.action);}}
 cue(type,action){if(this.voices.size>=16)return;const ctx=this.context,at=ctx.currentTime,rank=['attack','attack_2','attack_3'].indexOf(action),duration=type==='release'?.09:.12,gain=ctx.createGain();gain.gain.setValueAtTime(.001,at);gain.gain.exponentialRampToValueAtTime(type==='release'?.032:.045+rank*.008,at+.006);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);gain.connect(ctx.destination);
  const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),samples=buffer.getChannelData(0);let seed=733+rank*13;for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=(seed/0xffffffff*2-1)*(1-i/samples.length);}
  const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),tone=ctx.createOscillator(),toneGain=ctx.createGain();noise.buffer=buffer;filter.type=type==='release'?'bandpass':'lowpass';filter.frequency.setValueAtTime(type==='release'?1200+rank*250:750,at);filter.Q.value=.8;noise.connect(filter).connect(gain);tone.type=type==='release'?'sine':'triangle';tone.frequency.setValueAtTime(type==='release'?[660,784,988][rank]:rank===2?550:350,at);tone.frequency.exponentialRampToValueAtTime(type==='release'?420:150,at+duration);toneGain.gain.value=type==='release'?.14:.3;tone.connect(toneGain).connect(gain);
  const voice={noise,tone,gain,filter,toneGain};this.voices.add(voice);noise.onended=()=>{for(const n of [noise,tone,gain,filter,toneGain])n.disconnect();this.voices.delete(voice);};noise.start(at);tone.start(at);noise.stop(at+duration);tone.stop(at+duration);this.played++;
 }
 stop(){for(const v of this.voices){try{v.noise.stop();v.tone.stop();}catch{}v.gain.disconnect();}this.voices.clear();}
 reset(){this.heard.clear();this.stop();}
 diagnostics(){return{enabled:this.enabled,state:this.context?.state??'not-created',voices:this.voices.size,played:this.played};}
 dispose(){this.enabled=false;this.stop();void this.context?.close().catch(()=>{});}
}
