import type {GameEntryState,EntrySprite} from '../../core/game-entry-state';
import {GAME_ENTRY_IDS as IDS} from '../../core/game-entry-elements';
import {GameApi,EntryHttpError} from '../../net/game-api';
import {isAvatarId,type AvatarId} from '../../../../shared/profiles';
import {normalizeCharacterName} from '../../../../shared/game/entry';
import {EntryView} from './view';
import {EntryProfiles,readActiveCharacter} from './profiles';
import {attachEntryControls} from './controls';

export interface EntryCallbacks {play:()=>Promise<void>;leave:()=>Promise<void>;selected:(avatar:AvatarId,name:string)=>void;settings:()=>void}
// Coordinates use cases over one Core state object. View and transport remain separate.
export class EntryCoordinator {
  readonly view:EntryView;
  readonly profiles:EntryProfiles;
  private abort=new AbortController();
  private creation?:{fingerprint:string;id:string};
  private operation=0;
  private disposed=false;
  constructor(readonly state:GameEntryState,private api:GameApi,mount:HTMLElement,private callbacks:EntryCallbacks){
    this.view=new EntryView(state,mount);this.profiles=new EntryProfiles(state,api);
    attachEntryControls(this.view.root,{authenticate:(login,password)=>{void this.authenticate(login,password);},create:name=>{void this.create(name);},action:action=>{void this.action(action);},realm:id=>{void this.realm(id);},character:id=>this.character(id),avatar:id=>{if(!state.busy&&isAvatarId(id)){state.creatingAvatar=id;this.view.render();}},name:value=>state.draftName=value},this.abort.signal);
    this.view.render();
  }
  prepare(sprites:Partial<Record<AvatarId,EntrySprite>>){this.state.sprites=sprites;this.view.render();}
  private error(error:unknown){
    this.state.message=error instanceof Error?error.message:'Chưa xử lý được thao tác. Vui lòng thử lại.';
    this.state.requestId=error instanceof EntryHttpError?error.requestId:'';
    if(error instanceof EntryHttpError&&error.kind==='session_required'){this.state.session=undefined;this.state.realmId='';this.state.characters=[];this.state.selectedId='';this.state.phase='login';}
    this.view.render();
  }
  private async work(message:string,fn:()=>Promise<void>){
    if(this.disposed||this.state.busy)return;const operation=++this.operation,previousPhase=this.state.phase;this.state.busy=true;this.state.message=message;this.state.requestId='';this.view.render();
    try{await fn();if(operation!==this.operation)return;this.state.message='';}
    catch(error){if(operation===this.operation)this.error(error);}
    finally{if(operation===this.operation){this.state.busy=false;this.view.render();if(previousPhase!==this.state.phase&&this.state.phase!=='playing')this.view.focus();}}
  }
  async bootstrap(startAtTitle=false){
    if(this.disposed)return;
    this.state.phase='title';this.state.busy=true;this.state.message='Đang đọc hành trình…';this.view.render();
    try{
      this.state.session=await this.api.session();this.state.realms=await this.api.realms();
      if(this.disposed)return;
      const active=readActiveCharacter();
      if(active?.accountId===this.state.session.account.id&&this.state.realms.some(realm=>realm.id===active.realmId&&realm.status==='online')){
        this.state.realmId=active.realmId;this.state.characters=await this.api.characters(active.realmId);
        if(this.disposed)return;
        if(this.state.characters.some(character=>character.profile.id===active.characterId)){this.state.selectedId=active.characterId;this.selectNative();this.state.phase=startAtTitle?'title':'characters';if(!startAtTitle){this.state.busy=false;this.state.message='';this.view.render();await this.play();}return;}
        this.state.realmId='';
      }
    }catch(error){this.state.phase='title';this.state.session=undefined;if(!(error instanceof EntryHttpError&&error.code===401))this.error(error);}
    finally{if(!this.disposed){this.state.busy=false;if(this.state.message==='Đang đọc hành trình…')this.state.message='';this.view.render();this.view.focus();}}
  }
  private async begin(){await this.work('Đang xác nhận hành trình…',async()=>{
    try{this.state.session=await this.api.session();}catch(error){if(error instanceof EntryHttpError&&error.code===401){this.state.session=undefined;this.state.phase='login';return;}throw error;}
    this.state.realms=await this.api.realms();
    const realm=this.state.realms.find(realm=>realm.id===this.state.realmId&&realm.status==='online');
    if(realm){this.state.characters=await this.api.characters(realm.id);this.state.selectedId=this.state.characters.some(c=>c.profile.id===this.state.selectedId)?this.state.selectedId:this.state.characters[0]?.profile.id??'';this.state.phase='characters';this.selectNative();}
    else{this.state.realmId='';this.state.selectedId='';this.state.characters=[];this.state.phase='realms';}
  });}
  private async authenticate(login:string,password:string){await this.work('Đang xác thực tài khoản…',async()=>{
    this.state.session=await this.api.authenticate(this.state.loginMode,login,password);this.state.realms=await this.api.realms();this.state.realmId='';this.state.characters=[];this.state.selectedId='';this.state.phase='realms';this.view.render();this.view.focus();
  });}
  private async realm(id:string){if(!this.state.realms.some(value=>value.id===id&&value.status==='online'))return;await this.work('Đang đọc nhân vật…',async()=>{
    this.state.realmId=id;this.state.characters=await this.api.characters(id);this.state.selectedId=this.state.characters[0]?.profile.id??'';this.state.phase='characters';this.selectNative();this.view.render();this.view.focus();
  });}
  private selectNative(){const selected=this.profiles.selected;if(selected)this.callbacks.selected(selected.profile.avatarId,selected.profile.name);}
  private character(id:string){if(this.state.busy||!this.state.characters.some(value=>value.profile.id===id))return;this.state.selectedId=id;this.selectNative();this.view.render();this.view.focus(`[data-entry-character="${id}"]`);}
  private async create(name:string){
    const fingerprint=JSON.stringify([this.state.realmId,this.state.creatingAvatar,normalizeCharacterName(name)]);
    if(this.creation?.fingerprint!==fingerprint)this.creation={fingerprint,id:crypto.randomUUID()};const requestId=this.creation.id;
    await this.work('Đang tạo và lưu nhân vật…',async()=>{
      const value=await this.api.create({requestId,realmId:this.state.realmId,avatarId:this.state.creatingAvatar,name});
      this.state.characters=await this.api.characters(this.state.realmId);this.state.realms=await this.api.realms();this.state.selectedId=value.profile.id;this.state.draftName='';this.creation=undefined;this.state.phase='characters';this.selectNative();this.view.render();this.view.focus('[data-entry-action="play"]');
    });
  }
  private async play(){if(!this.profiles.selected)return;await this.work('Đang vào thế giới…',async()=>{this.state.phase='entering';this.view.render();await this.callbacks.play();});}
  private async action(action:string){
    if(this.state.busy)return;
    switch(action){
      case 'begin':await this.begin();break;
      case 'title':this.state.phase='title';this.state.message='';this.state.requestId='';this.view.render();this.view.focus();break;
      case 'login-mode':case 'register-mode':this.state.loginMode=action==='login-mode'?'login':'register';this.state.message='';this.view.render();this.view.focus('#'+IDS.login);break;
      case 'settings':this.callbacks.settings();break;
      case 'create':this.state.phase='create';this.state.message='';this.view.render();this.view.focus('#'+IDS.characterName);break;
      case 'back-characters':this.state.phase='characters';this.state.message='';this.view.render();this.view.focus();break;
      case 'back-realms':this.state.realmId='';this.state.selectedId='';this.state.characters=[];this.profiles.clearActive();this.state.phase='realms';this.state.message='';this.view.render();break;
      case 'refresh':await this.work('Đang đọc lại danh sách…',async()=>{this.state.realms=await this.api.realms();});break;
      case 'play':await this.play();break;
      case 'logout':await this.work('Đang đăng xuất…',async()=>{await this.callbacks.leave();await this.api.logout();this.profiles.clearActive();this.state.session=undefined;this.state.realmId='';this.state.characters=[];this.state.selectedId='';this.state.phase='login';});break;
    }
  }
  syncNetwork(playing:boolean,connecting:boolean,error?:string){
    if(!this.state.session)return;
    const previous=this.state.phase;
    if(playing)this.state.phase='playing';else if(connecting)this.state.phase='entering';else if(this.state.phase==='playing'||this.state.phase==='entering')this.state.phase=this.state.realmId?'characters':'realms';
    if(error&&!this.state.busy){this.state.message=error;this.state.requestId='';}
    if(previous!==this.state.phase||error)this.view.render();
  }
  async revoked(message:string){
    const previousRealm=this.state.realmId;
    await this.callbacks.leave();this.profiles.clearActive();try{this.state.session=await this.api.session();this.state.realms=await this.api.realms();if(this.state.realms.find(realm=>realm.id===previousRealm)?.status==='maintenance')message='Server đang bảo trì. Vui lòng chọn server khác hoặc quay lại sau.';this.state.realmId='';this.state.selectedId='';this.state.characters=[];this.state.phase='realms';}catch{this.state.session=undefined;this.state.phase='login';}
    this.state.message=message;this.view.render();this.view.focus();
  }
  failed(error:unknown){this.error(error);if(this.state.phase==='entering')this.state.phase='characters';this.view.render();}
  logout(){return this.action('logout');}
  async home(){await this.work('Đang lưu và rời thế giới…',async()=>{await this.callbacks.leave();this.state.phase='title';});}
  diagnostics(){return {phase:this.state.phase,busy:this.state.busy,accountId:this.state.session?.account.id,role:this.state.session?.account.role,realmId:this.state.realmId,selectedId:this.state.selectedId,characters:this.state.characters.map(({realmId,profile})=>({realmId,id:profile.id,avatarId:profile.avatarId,name:profile.name})),message:this.state.message};}
  dispose(){this.disposed=true;this.operation++;this.abort.abort();this.view.dispose();}
}
