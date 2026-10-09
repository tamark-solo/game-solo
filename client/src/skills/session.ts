import type { Room } from '@colyseus/sdk';
import type { CourtyardState } from '@shared/protocol/courtyard-state';
import { SKILL_DEFINITIONS } from '../../../shared/skills/definitions';
import { cooldownField } from '../../../shared/skills/commands';
import type { SkillEvent, CastResult } from '../../../shared/skills/contracts';
import { R01_IDS, type SkillId } from '../../../shared/profiles';
import type { Input } from '@shared/world/types';
import { SkillAim } from './aim';
import { resolveSkillAim } from '../../../shared/skills/aim';
import { SkillHotbar } from './hotbar';

interface Options {
  room:()=>Room<CourtyardState>|undefined;online:()=>boolean;now:()=>number;
  facing:()=>string;movement:()=>Input;inputSequence:()=>number;
  resources:()=>{hp:number;mp:number};
  feedback:(text:string)=>void;focus:()=>void;event:(event:SkillEvent)=>void;basic:()=>void;
}
const rejected:Record<string,string>={cooldown:'Thuật đang hồi.',resource:'Không đủ linh lực.',target:'Chọn mục tiêu luyện còn sức bền trong tầm.',
  casting:'Đang thi triển thuật.',blocked:'Hướng lướt đã bị chặn.',save:'Chưa lưu được hồ sơ; thuật chưa thi triển.',rights:'Hồ sơ chưa có quyền dùng thuật này.',inactive:'Nhân vật chưa sẵn sàng.',input:'Chưa nhận được input di chuyển; hãy thử lại.'};
// UI/transport adapter. Sending a command never starts pose, VFX or applies gameplay locally.
export class SkillSession {
  private aiming=new SkillAim();
  private hotbar:SkillHotbar;
  private feedbackTimer?:ReturnType<typeof setTimeout>;
  get aim():Input {return this.aiming.value(this.options.facing());}
  selectedTarget='';
  private attached=new WeakSet<object>();
  constructor(private options:Options){
    this.hotbar=new SkillHotbar(document.getElementById('hotbar-mount')!,{
      cast:id=>this.sendCast(id),blocked:reason=>{this.options.feedback(reason);this.options.focus();},
    });
    this.hotbar.setIconAtlas('/assets/skill-hud/skill-icons-v2.webp');
    this.hotbar.setFrame('/assets/skill-hud/cultivation-frame-v3.webp');
    this.hotbar.setOrbTexture('/assets/skill-hud/orb-textures-v2.webp');
    this.hotbar.update({now:0,hp:100,maxHp:100,mp:100,maxMp:100,online:false,hasTarget:false,cooldownEnds:{},aimLabel:'Kiếm / Phong ↓'});
    document.getElementById('training')!.addEventListener('click',()=>this.practice());
    document.getElementById('basic-attack')!.addEventListener('click',()=>this.basic());
    document.getElementById('hud-effects')!.addEventListener('change',event=>{this.hotbar.setEffectsEnabled((event.target as HTMLInputElement).checked);this.options.focus();});
  }
  announce(text:string):void {
    clearTimeout(this.feedbackTimer);this.hotbar.announce(text);
    if(text)this.feedbackTimer=setTimeout(()=>this.hotbar.announce(''),5000);
  }
  attach(room:Room<CourtyardState>):void {
    if(this.attached.has(room))return;this.attached.add(room);this.reset();
    room.onMessage('skill:event',(event:SkillEvent)=>{
      this.options.event(event);if(event.actorId!==room.sessionId)return;
      const name=SKILL_DEFINITIONS[event.skillId].name;
      if(event.type==='hit')this.options.feedback(`${name} trúng mục tiêu · ${event.damage} sát thương`);
      if(event.type==='miss')this.options.feedback(`${name} không trúng mục tiêu.`);
      if(event.type==='cancel')this.options.feedback('Đã hủy thi triển khi đổi hướng di chuyển.');
    });
    room.onMessage('skill:result',(result:CastResult)=>this.options.feedback(result.accepted?
      `Đang thi triển ${SKILL_DEFINITIONS[result.skillId!].name}…`:rejected[result.reason??'']??'Không thể thi triển lúc này.'));
    room.onMessage('training:result',(result:{ok:boolean;targetId?:string;reason?:string})=>{
      if(result.reason==='lesson_active'){this.options.feedback('Đang có mục tiêu của bài học. Dừng bài trước khi tạo mục tiêu luyện tự do.');return;}
      this.selectedTarget=result.targetId??'';this.update();
      this.options.feedback(result.ok?'Mục tiêu đã chọn · phím 1 Kiếm, 2 Lôi · phím 3 lướt theo hướng ngắm.':'Không đủ khoảng trống để đặt mục tiêu. Chọn hướng khác.');
    });
    this.options.feedback('Ba thuật R01 sẵn sàng. Tạo mục tiêu để luyện Kiếm và Lôi.');
  }
  shortcut(event:KeyboardEvent):SkillId|undefined {
    if(event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;
    return R01_IDS.find(id=>event.key===SKILL_DEFINITIONS[id].shortcut||event.code===`Digit${SKILL_DEFINITIONS[id].shortcut}`);
  }
  cast(skill:SkillId):void {
    if(!R01_IDS.includes(skill))return;
    this.moveAim(this.options.movement());
    this.update();this.hotbar.activate(skill);
  }
  private sendCast(skill:SkillId):void {
    const room=this.options.room(),own=room?.state.players?.get(room.sessionId);
    if(!this.options.online()||!room||!own?.connected)return;
    const aim=resolveSkillAim(SKILL_DEFINITIONS[skill].aim,this.aim,own,room.state.targets?.get(this.selectedTarget));
    room.send('skill:cast',{id:crypto.randomUUID(),skillId:skill,aimX:aim.x,aimY:aim.y,targetId:this.selectedTarget,inputSeq:this.options.inputSequence()});this.options.focus();
  }
  basic():void {
    if(!this.options.online()||!this.selectedTarget){this.options.feedback('Chọn mục tiêu luyện của bạn để đánh thường.');return;}
    this.options.basic();this.options.focus();
  }
  practice():void {this.moveAim(this.options.movement());if(this.options.online())this.options.room()?.send('training:start',this.aim);this.options.focus();}
  setAim(x:number,y:number):void {this.aiming.point({x,y});this.updateAim();}
  moveAim(input:Input):void {this.aiming.observeMovement(input);this.updateAim();}
  diagnostics():{aim:Input;source:string;nextInputSequence:number} {return {aim:this.aim,source:this.aiming.source,nextInputSequence:this.options.inputSequence()};}
  private aimLabel():string {
    const aim=this.aim,arrows=['→','↘','↓','↙','←','↖','↑','↗'];
    const arrow=arrows[(Math.round(Math.atan2(aim.y,aim.x)/(Math.PI/4))+8)%8];
    const source={facing:'hướng nhân vật',movement:'hướng di chuyển',pointer:'đã ngắm'}[this.aiming.source];
    return `Kiếm / Phong ${arrow} · ${source}`;
  }
  updateAim():void {
    const indicator=document.getElementById('skill-aim'),text=this.aimLabel();
    if(indicator&&indicator.textContent!==text)indicator.textContent=text;
    this.update();
  }
  selectTarget(x:number,y:number):void {
    const room=this.options.room();if(!room)return;
    room.state.targets?.forEach(t=>{if(t.ownerId===room.sessionId&&Math.hypot(x-t.x,y-t.y+36)<45)this.selectedTarget=t.id;});
    this.update();
  }
  update():void {
    const room=this.options.room(),own=room?.state.players?.get(room.sessionId),now=this.options.now();
    const online=this.options.online()&&!!own?.connected;
    (document.getElementById('training') as HTMLButtonElement).disabled=!online||!!own?.castId;
    (document.getElementById('basic-attack') as HTMLButtonElement).disabled=!online||!!own?.castId;
    // Connected transport precedes decoding the first schema snapshot.
    const target=room?.state.targets?.get(this.selectedTarget);
    const hasTarget=!!(own&&target&&target.ownerId===room?.sessionId&&target.hp>0&&
      Math.hypot(target.x-own.x,target.y-own.y)<=SKILL_DEFINITIONS.thunder.range);
    const resources=this.options.resources();
    const castingSkill=own?.castId&&R01_IDS.includes(own.castSkill as SkillId)?own.castSkill as SkillId:undefined;
    this.hotbar.update({now,hp:own?.hp??resources.hp,maxHp:100,mp:own?.mp??resources.mp,maxMp:100,
      online,hasTarget,castingSkill,aimLabel:this.aimLabel(),
      cooldownEnds:Object.fromEntries(R01_IDS.map(id=>[id,own?.[cooldownField(id)]??0])),
    });
  }
  reset():void {this.selectedTarget='';this.aiming.reset();this.hotbar.hideTooltip();this.updateAim();}
  dispose():void {clearTimeout(this.feedbackTimer);this.hotbar.dispose();}
}
