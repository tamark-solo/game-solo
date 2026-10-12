import type {GameAdminState} from '../../core/game-admin-state';
import {GAME_ADMIN_IDS as IDS} from '../../core/game-admin-state';
import {GameApi,EntryHttpError} from '../../net/game-api';
import {AdminView} from './view';
import {isContentDomain,contentKey,filterContentRecords,CONTENT_SUBTYPES} from '../../../../shared/content/catalog';

export class AdminCoordinator {
  readonly view:AdminView;
  private abort=new AbortController();
  constructor(readonly state:GameAdminState,private api:GameApi,mount:HTMLElement){
    this.view=new AdminView(state,mount);this.view.render();const signal=this.abort.signal;
    mount.addEventListener('submit',event=>{event.preventDefault();void this.submit(event.target as HTMLFormElement);},{signal});
    mount.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;
      if(button.dataset.adminTab==='operations'||button.dataset.adminTab==='catalog'){state.tab=button.dataset.adminTab;void this.work('Đang đọc dữ liệu…',()=>this.load());}
      else if(button.dataset.catalogRecord&&!state.busy){const records=state.catalog?.catalog?.records??[];if(records.some(r=>contentKey(r)===button.dataset.catalogRecord)){state.catalogSelection=button.dataset.catalogRecord;this.view.render();this.view.root.querySelector<HTMLElement>('#'+IDS.catalogDetail)?.focus();}}
      else if(button.dataset.adminAccount)void this.work('Đang cập nhật tài khoản…',async()=>{await api.accountStatus(button.dataset.adminAccount!,button.dataset.status as 'active'|'blocked');await this.load();});
      else if(button.dataset.adminAction==='logout')void this.work('Đang đăng xuất…',async()=>{await api.logout();state.session=undefined;state.snapshot=undefined;state.status=undefined;state.catalog=undefined;this.view.render();});
      else if(button.dataset.adminAction){if(button.dataset.adminAction==='next')state.offset+=20;if(button.dataset.adminAction==='previous')state.offset=Math.max(0,state.offset-20);void this.work('Đang đọc dữ liệu…',()=>this.load());}
    },{signal});
  }
  private async submit(form:HTMLFormElement){
    const values=new FormData(form),kind=form.dataset.adminForm;
    if(kind==='catalog-filter'){
      const domain=values.get('domain'),implementation=values.get('implementation'),subtype=String(values.get('subtype')??'');
      this.state.catalogFilters={query:String(values.get('query')??'').slice(0,120),domain:isContentDomain(domain)?domain:'',implementation:implementation==='implemented-local'||implementation==='unreleased'?implementation:'',subtype:(!isContentDomain(domain)||CONTENT_SUBTYPES[domain].includes(subtype))?subtype:''};
      this.state.catalogSelection=filterContentRecords(this.state.catalog?.catalog?.records??[],this.state.catalogFilters).map(contentKey)[0];this.view.render();return;
    }
    await this.work('Đang xử lý…',async()=>{
      if(kind==='login'){this.state.session=await this.api.authenticate('login',String(values.get('login')),String(values.get('password')));if(this.state.session.account.role==='admin')await this.load();else this.view.render();return;}
      const create=kind==='new-realm';await this.api.realm({id:create?String(values.get('id')):form.dataset.id!,name:String(values.get('name')),status:create?'online':values.get('status') as 'online'|'maintenance',characterSlots:Number(values.get('slots')),creationEnabled:create||values.get('creation')==='on',updatedAt:0},create);await this.load();
    });
  }
  private async load(){
    if(this.state.tab==='catalog'){
      const catalog=await this.api.catalog();if(this.abort.signal.aborted)return;
      this.state.catalog=catalog;const records=catalog.catalog?.records??[];
      if(!records.some(r=>contentKey(r)===this.state.catalogSelection))this.state.catalogSelection=records.map(contentKey)[0];
    }else{const [snapshot,status]=await Promise.all([this.api.admin(this.state.offset),this.api.status()]);if(this.abort.signal.aborted)return;this.state.snapshot=snapshot;this.state.status=status;}
    this.view.render();
  }
  private async work(message:string,fn:()=>Promise<void>){if(this.state.busy)return;this.state.busy=true;this.state.message=message;this.state.requestId='';this.view.status();
    try{await fn();this.state.message='Đã đọc và xác nhận dữ liệu từ backend.';}
    catch(error){this.state.message=error instanceof Error?error.message:'Chưa xử lý được yêu cầu.';this.state.requestId=error instanceof EntryHttpError?error.requestId:'';if(error instanceof EntryHttpError&&error.code===401){this.state.session=undefined;this.state.snapshot=undefined;this.state.catalog=undefined;this.view.render();}}
    finally{this.state.busy=false;this.view.status();}
  }
  async bootstrap(){try{this.state.session=await this.api.session();if(this.state.session.account.role==='admin')await this.load();}catch(error){if(!(error instanceof EntryHttpError&&error.code===401))this.state.message=error instanceof Error?error.message:'Chưa kết nối được backend.';}finally{this.state.loading=false;this.view.render();}}
  dispose(){this.abort.abort();}
}
