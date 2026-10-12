import type {Room} from '@colyseus/sdk';
import type {CourtyardState} from '../../shared/protocol/courtyard-state';
import type {AvatarId} from '../../shared/profiles';
import type {CharacterView,CharacterResult,CharacterCommand,CharacterItemView} from '../../shared/character-inventory';
import {CharacterPanel} from './character-panel';

interface Options {room:()=>Room<CourtyardState>|undefined;online:()=>boolean;avatar:()=>AvatarId;clock:()=>number;opened:()=>void;closed:()=>void;journal:()=>void}
const REASONS:Record<string,string>={save:'Chưa lưu được thay đổi. Hành trang được giữ nguyên.',combat:'Chờ kết thúc luyện thuật trước khi dùng hoặc thay đồ.',item:'Vật phẩm không có trong hành trang hiện tại.',kind:'Vật phẩm không dùng được theo cách này.',not_equipped:'Món này chưa được trang bị.',full_hp:'Sinh lực đã đầy; vật tư được giữ lại.',cooldown:'Vật tư đang hồi.',supplies:'Đã hết vật tư hồi phục.',inactive:'Nhân vật chưa sẵn sàng.',invalid:'Thao tác chưa hợp lệ.',profile:'Chưa đọc được hồ sơ.',request_reused:'Mã thao tác đã được dùng cho một yêu cầu khác.'};
// Transport only. No command queue, replay or optimistic item/HP update.
export class CharacterSession {
  readonly panel:CharacterPanel;
  private view?:CharacterView;
  private synced=false;
  private attached=new WeakSet<object>();
  private pending?:CharacterCommand;
  private ack?:CharacterResult;
  private timer?:ReturnType<typeof setTimeout>;
  private lastTransport=false;
  constructor(private options:Options){
    this.panel=new CharacterPanel({command:(action,item)=>this.send(action,item),opened:options.opened,closed:options.closed,journal:options.journal,clock:options.clock});
  }
  private get online(){const room=this.options.room(),own=room?.state.players?.get(room.sessionId);return this.options.online()&&this.synced&&!!own?.connected&&own.profileId===this.view?.profileId;}
  attach(room:Room<CourtyardState>){
    this.invalidate();
    if(!this.attached.has(room)){
      this.attached.add(room);
      room.onMessage('character:state',(view:CharacterView)=>{
        if(this.options.room()!==room||view.avatarId!==this.options.avatar())return;
        const own=room.state.players?.get(room.sessionId);if(own?.profileId&&view.profileId!==own.profileId)return;
        this.view=view;this.synced=true;
        if(this.pending&&this.ack){const ack=this.ack;this.cancelPending();this.panel.feedback(ack.ok?'Đã lưu thay đổi hành trang.':REASONS[ack.reason??'']??'Chưa thực hiện được thao tác.');}
        this.update();
      });
      room.onMessage('character:result',(result:CharacterResult)=>{
        if(this.options.room()!==room||!this.pending||result.requestId!==this.pending.id)return;
        this.ack=result;
        // Server sends the committed snapshot after this ack. Keep controls
        // pending until that snapshot arrives, including failed transactions.
      });
      room.onLeave(()=>{if(this.options.room()===room)this.invalidate();});
    }
    room.send('character:sync');
  }
  open(tab:'overview'|'inventory'|'equipment'='overview'){
    this.panel.open(tab);
    const room=this.options.room();if(this.options.online()&&room?.connection.isOpen){this.synced=false;this.update();room.send('character:sync');}
  }
  update(){
    const transport=this.options.online()&&!!this.options.room()?.connection.isOpen;
    if(!transport&&this.lastTransport)this.invalidate();this.lastTransport=transport;
    this.panel.state(this.view,this.online,!!this.pending);
  }
  private send(action:CharacterCommand['action'],item:CharacterItemView){
    if(!this.online||this.pending){this.panel.feedback('Chờ đồng bộ hành trang trước khi thao tác.');return;}
    const id=crypto.randomUUID();const command:CharacterCommand=action==='protect'?{id,action,itemId:item.id,protected:!item.protected}:{id,action,itemId:item.id};
    this.pending=command;this.ack=undefined;this.panel.feedback('Đang chờ máy chủ xác nhận…');this.update();
    try{this.options.room()!.send('character:command',command);}catch{this.invalidate();this.panel.feedback('Mất kết nối. Thao tác chưa được gửi lại.');return;}
    this.timer=setTimeout(()=>{
      if(this.pending?.id!==id)return;this.cancelPending();this.synced=false;this.panel.feedback('Chưa nhận được xác nhận. Đang đọc lại hành trang…');this.update();
      const room=this.options.room();if(this.options.online()&&room?.connection.isOpen)room.send('character:sync');
    },6000);
  }
  private cancelPending(){clearTimeout(this.timer);this.timer=undefined;this.pending=undefined;this.ack=undefined;}
  private invalidate(){const pending=!!this.pending;this.cancelPending();this.synced=false;if(pending)this.panel.feedback('Kết nối gián đoạn. Chờ đọc lại hành trang; thao tác không tự gửi lại.');this.panel.state(this.view,false,false);}
  reset(){this.cancelPending();this.synced=false;this.view=undefined;this.panel.reset();}
  diagnostics(){return {...this.panel.diagnostics(),synced:this.synced,request:this.pending?.id};}
  dispose(){this.cancelPending();this.panel.dispose();}
}
