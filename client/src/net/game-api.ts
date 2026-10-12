import type {GameSessionView,RealmView,RealmCharacter,CharacterCreate,PlayTicketView,GameApiError,GameRealm,AdminSnapshot} from '../../../shared/game/entry';
import type {CatalogSnapshot} from '../../../shared/content/catalog';

export class EntryHttpError extends Error {
  constructor(readonly code:number,readonly kind:string,message:string,readonly requestId:string){super(message);this.name='EntryHttpError';}
}
// HTTP transport only. Credentials live in HttpOnly cookies, not browser storage.
export class GameApi {
  private csrf='';
  constructor(private endpoint:string){}
  private async request<T>(path:string,method='GET',body?:unknown):Promise<T>{
    const headers:Record<string,string>={'X-Request-Id':crypto.randomUUID()};
    if(method!=='GET'){headers['Content-Type']='application/json';headers['X-Game-Client']='h5';if(this.csrf)headers['X-Game-CSRF']=this.csrf;}
    let response:Response;
    try{response=await fetch(this.endpoint+'/api/game'+path,{method,headers,credentials:'include',cache:'no-store',body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});}
    catch{throw new EntryHttpError(0,'network','Chưa kết nối được máy chủ. Kiểm tra mạng rồi thử lại.','');}
    const data=await response.json().catch(()=>undefined) as T|GameApiError|undefined;
    if(!response.ok){const error=data as GameApiError|undefined;throw new EntryHttpError(response.status,error?.code??'http',error?.message??'Chưa xử lý được yêu cầu.',error?.requestId??response.headers.get('X-Request-Id')??'');}
    return data as T;
  }
  async session(){const value=await this.request<GameSessionView>('/session');this.csrf=value.csrf;return value;}
  async authenticate(mode:'login'|'register',login:string,password:string){const value=await this.request<GameSessionView>('/'+mode,'POST',{login,password});this.csrf=value.csrf;return value;}
  async logout(){await this.request('/logout','POST',{});this.csrf='';}
  realms(){return this.request<{realms:RealmView[]}>('/realms').then(value=>value.realms);}
  characters(realmId:string){return this.request<{characters:RealmCharacter[]}>('/characters?realmId='+encodeURIComponent(realmId)).then(value=>value.characters);}
  create(command:CharacterCreate){return this.request<RealmCharacter>('/characters','POST',command);}
  ticket(realmId:string,characterId:string){return this.request<PlayTicketView>('/play-ticket','POST',{realmId,characterId});}
  admin(offset=0){return this.request<AdminSnapshot>('/admin?offset='+offset);}
  status(){return this.request<Record<string,unknown>>('/admin/status');}
  catalog(){return this.request<CatalogSnapshot>('/admin/catalog');}
  accountStatus(id:string,status:'active'|'blocked'){return this.request('/admin/accounts/'+encodeURIComponent(id),'PATCH',{status});}
  realm(value:GameRealm,create=false){const {id,updatedAt:_,...fields}=value;return this.request<GameRealm>(create?'/admin/realms':'/admin/realms/'+encodeURIComponent(id),create?'POST':'PATCH',create?{id,...fields}:fields);}
}
