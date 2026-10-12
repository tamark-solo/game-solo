import {initialProfile,isAvatarId,publicProfile} from '../../../shared/profiles';
import {HANG_NHAC} from '../../../shared/hang-nhac';
import {normalizeLogin,validLogin,validPassword,normalizeCharacterName,characterNameKey,validCharacterName,validRequestId,validRealmId,
  type GameAccount,type GameRealm,type GameSessionView,type CharacterCreate,type PlayTicketView,type RealmCharacter,type RealmView,type AdminSnapshot} from '../../../shared/game/entry';
import {GameError,denied} from '../core/errors';
import type {GameRepositories,PasswordHasher,IdentitySource,GameLogger,SessionRecord,AccountRecord,PlayGrant,PlayGateway} from '../core/ports';

const DAY=86_400_000;
const ownKeys=(raw:Record<string,unknown>,keys:string[])=>Object.keys(raw).every(key=>keys.includes(key));
const object=(raw:unknown):Record<string,unknown>=>{if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new GameError('invalid',400,'Thông tin gửi lên chưa hợp lệ.');return raw as Record<string,unknown>;};
const publicAccount=({passwordHash:_,...value}:AccountRecord):GameAccount=>value;
export interface EntryServiceOptions {repositories:GameRepositories;passwords:PasswordHasher;identity:IdentitySource;logger:GameLogger;nodeId:string;clock?:()=>number;sessionMs?:number;idleMs?:number;allowLocalAdminShortPassword?:boolean}
export interface Authenticated {account:AccountRecord;session:SessionRecord}

// Application policy. No HTTP, SQLite, Colyseus or browser dependencies.
export class EntryService implements PlayGateway {
  private repos:GameRepositories;
  private now:()=>number;
  private sessionMs:number;
  private idleMs:number;
  constructor(private options:EntryServiceOptions){this.repos=options.repositories;this.now=options.clock??Date.now;this.sessionMs=options.sessionMs??7*DAY;this.idleMs=options.idleMs??DAY;}
  private audit(actorId:string,action:string,targetId:string,requestId:string,detail:Record<string,string|number|boolean>={}){
    this.repos.audit.append({at:this.now(),actorId,action,targetId,requestId,detail});
  }
  private rate(key:string,limit=30){if(!this.repos.rates.consume(this.options.identity.digest(key),this.now(),300_000,limit))throw new GameError('rate_limited',429,'Bạn thao tác quá nhanh. Vui lòng chờ rồi thử lại.');}
  private realm(id:unknown,online=false):GameRealm {
    const realm=typeof id==='string'?this.repos.realms.get(id):undefined;if(!realm)throw new GameError('realm_missing',404,'Không tìm thấy server đã chọn.');
    if(online&&realm.status!=='online')throw new GameError('maintenance',503,'Server đang bảo trì. Vui lòng quay lại chọn server.');return realm;
  }
  private authenticatedKey(key:string):Authenticated {
    const session=this.repos.sessions.get(key),now=this.now();
    if(!session||session.revokedAt!==null||session.expiresAt<=now||session.touchedAt+this.idleMs<=now)throw denied();
    const account=this.repos.accounts.get(session.accountId);if(!account||account.status!=='active')throw denied();
    if(now-session.touchedAt>=60_000)this.repos.sessions.touch(key,now);return {session,account};
  }
  authenticate(secret:unknown):Authenticated {
    if(typeof secret!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(secret))throw denied();return this.authenticatedKey(this.options.identity.digest(secret));
  }
  session(secret:unknown):GameSessionView {const {session,account}=this.authenticate(secret);return {account:publicAccount(account),csrf:session.csrf,expiresAt:session.expiresAt};}
  checkCsrf(auth:Authenticated,csrf:unknown){if(typeof csrf!=='string'||this.options.identity.digest(csrf)!==this.options.identity.digest(auth.session.csrf))throw new GameError('csrf',403,'Phiên thao tác chưa hợp lệ. Hãy tải lại màn đăng nhập.');}
  private issueSession(account:AccountRecord,requestId:string){
    const secret=this.options.identity.secret(),key=this.options.identity.digest(secret),now=this.now(),session:SessionRecord={key,accountId:account.id,csrf:this.options.identity.secret(),createdAt:now,expiresAt:now+this.sessionMs,touchedAt:now,revokedAt:null};
    this.repos.transaction(()=>{if(this.repos.accounts.get(account.id)?.status!=='active')throw denied();this.repos.sessions.insert(session);this.audit(account.id,'session.login',account.id,requestId);});
    this.options.logger.event('session.login',{requestId,accountId:account.id});return {secret,view:{account:publicAccount(account),csrf:session.csrf,expiresAt:session.expiresAt}};
  }
  private adminPassword(value:unknown):value is string{return validPassword(value)||this.options.allowLocalAdminShortPassword===true&&typeof value==='string'&&value.length>=8&&value.length<=128&&!value.includes('\0');}
  private credentials(raw:unknown,adminLogin=false){const value=object(raw);if(!ownKeys(value,['login','password'])||!validLogin(value.login)||typeof value.password!=='string'||!(adminLogin?this.adminPassword(value.password):validPassword(value.password)))throw new GameError('credentials',400,'Tài khoản cần 3–32 ký tự chữ/số; mật khẩu cần 12–128 ký tự.');return {login:normalizeLogin(value.login),password:value.password};}
  async register(raw:unknown,ip:string,requestId:string){
    const {login,password}=this.credentials(raw);this.rate(`register:${ip}`,10);const passwordHash=await this.options.passwords.hash(password);
    const account:AccountRecord={id:this.options.identity.id(),login,passwordHash,role:'player',status:'active',createdAt:this.now()};
    this.repos.transaction(()=>{if(this.repos.accounts.find(login))throw new GameError('login_unavailable',409,'Tên tài khoản này chưa thể sử dụng.');this.repos.accounts.insert(account);this.audit(account.id,'account.register',account.id,requestId);});
    return this.issueSession(account,requestId);
  }
  async login(raw:unknown,ip:string,requestId:string){
    const {login,password}=this.credentials(raw,true);this.rate(`login-ip:${ip}`);this.rate(`login-account:${login}`,10);
    const account=this.repos.accounts.find(login),verified=await this.options.passwords.verify(password,account?.passwordHash);
    if(!verified||!account||account.status!=='active'||!validPassword(password)&&account.role!=='admin'){this.options.logger.event('session.denied',{requestId,code:'login_failed'});throw new GameError('login_failed',401,'Tài khoản hoặc mật khẩu chưa đúng, hoặc tài khoản chưa thể đăng nhập.');}
    return this.issueSession(account,requestId);
  }
  logout(auth:Authenticated,requestId:string){this.repos.transaction(()=>{this.repos.sessions.revoke(auth.session.key,this.now());this.audit(auth.account.id,'session.logout',auth.account.id,requestId);});this.options.logger.event('session.logout',{requestId,accountId:auth.account.id});}
  realms(auth:Authenticated):RealmView[]{return this.repos.realms.list().map(realm=>({...realm,characters:this.repos.characters.count(auth.account.id,realm.id)}));}
  characters(auth:Authenticated,realmId:unknown):RealmCharacter[]{const realm=this.realm(realmId);return this.repos.characters.list(auth.account.id,realm.id);}
  createCharacter(auth:Authenticated,raw:unknown,requestId:string):RealmCharacter{
    const v=object(raw);if(!ownKeys(v,['requestId','realmId','avatarId','name'])||!validRequestId(v.requestId)||!validRealmId(v.realmId)||!isAvatarId(v.avatarId)||!validCharacterName(v.name))throw new GameError('character_invalid',400,'Chọn nhân vật và đặt tên từ 2–24 ký tự chữ/số.');
    const command:CharacterCreate={requestId:v.requestId,realmId:v.realmId,avatarId:v.avatarId,name:normalizeCharacterName(v.name)};
    this.rate(`create:${auth.account.id}`,20);const fingerprint=JSON.stringify([command.realmId,command.avatarId,characterNameKey(command.name)]);
    const character=this.repos.transaction(()=>{
      this.authenticatedKey(auth.session.key);
      const existing=this.repos.characters.receipt(auth.account.id,command.requestId);
      if(existing){if(existing.fingerprint!==fingerprint)throw new GameError('request_reused',409,'Mã tạo nhân vật đã dùng cho thông tin khác.');const row=this.repos.characters.get(existing.characterId);if(!row||row.accountId!==auth.account.id)throw new Error('Creation receipt has no owned character.');return {realmId:row.realmId,profile:publicProfile(row.profile)};}
      const realm=this.realm(command.realmId,true);if(!realm.creationEnabled)throw new GameError('creation_closed',409,'Server đang tạm đóng tạo nhân vật mới.');
      if(this.repos.characters.count(auth.account.id,realm.id)>=realm.characterSlots)throw new GameError('slots_full',409,'Đã đủ số nhân vật trên server này.');
      const nameKey=characterNameKey(command.name);if(this.repos.characters.named(realm.id,nameKey))throw new GameError('name_taken',409,'Tên nhân vật đã có trên server này. Hãy chọn tên khác.');
      const profile=initialProfile(this.options.identity.id(),auth.account.id,command.avatarId,this.now());profile.name=command.name;
      this.repos.characters.insert({id:profile.id,accountId:auth.account.id,realmId:realm.id,avatarId:command.avatarId,nameKey,profile});
      this.repos.characters.record(auth.account.id,command.requestId,{fingerprint,characterId:profile.id});
      this.audit(auth.account.id,'character.create',profile.id,requestId,{realmId:realm.id,avatarId:profile.avatarId});return {realmId:realm.id,profile:publicProfile(profile)};
    });
    this.options.logger.event('character.create',{requestId,accountId:auth.account.id,realmId:character.realmId,characterId:character.profile.id});return character;
  }
  ticket(auth:Authenticated,raw:unknown,requestId:string):PlayTicketView {
    const v=object(raw);if(!ownKeys(v,['realmId','characterId'])||!validRealmId(v.realmId)||typeof v.characterId!=='string')throw new GameError('invalid',400,'Chọn lại server và nhân vật.');
    this.rate(`ticket:${auth.account.id}`,60);const realm=this.realm(v.realmId,true),row=this.repos.characters.get(v.characterId);
    if(!row||row.accountId!==auth.account.id||row.realmId!==realm.id)throw new GameError('character_missing',404,'Nhân vật không có trong tài khoản/server này.');
    const ticket=this.options.identity.secret(),expiresAt=this.now()+60_000;
    this.repos.tickets.insert({key:this.options.identity.digest(ticket),sessionKey:auth.session.key,accountId:auth.account.id,realmId:realm.id,characterId:row.id,expiresAt,consumedAt:null});
    this.options.logger.event('play.ticket',{requestId,accountId:auth.account.id,characterId:row.id,realmId:realm.id});
    return {ticket,realmId:realm.id,characterId:row.id,avatarId:row.avatarId,mapVersion:HANG_NHAC.version,expiresAt};
  }
  claim(secret:unknown,realmId:unknown,clientId:string):PlayGrant {
    if(typeof secret!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(secret))throw denied();
    const grant=this.repos.transaction(()=>{
      const key=this.options.identity.digest(secret),ticket=this.repos.tickets.get(key),now=this.now();
      if(!ticket||ticket.consumedAt!==null||ticket.expiresAt<=now||ticket.realmId!==realmId)throw new GameError('ticket_invalid',401,'Phiên vào game đã hết. Vui lòng chọn nhân vật và vào lại.');
      const auth=this.authenticatedKey(ticket.sessionKey);if(auth.account.id!==ticket.accountId)throw denied();this.realm(ticket.realmId,true);
      const row=this.repos.characters.get(ticket.characterId);if(!row||row.accountId!==ticket.accountId||row.realmId!==ticket.realmId)throw denied();
      if(!this.repos.leases.acquire(row.accountId,row.id,clientId,this.options.nodeId,now,now+30_000))throw new GameError('character_busy',409,'Tài khoản đang điều khiển nhân vật ở phiên khác. Rời game tại phiên đó trước.');
      if(!this.repos.tickets.consume(key,now))throw denied();
      return {accountId:auth.account.id,sessionKey:ticket.sessionKey,characterId:row.id,realmId:row.realmId,profile:row.profile,persistence:this.repos.profiles};
    });
    this.options.logger.event('play.claim',{accountId:grant.accountId,characterId:grant.characterId,realmId:grant.realmId,clientId});return grant;
  }
  renew(grant:PlayGrant,clientId:string){
    try{this.authenticatedKey(grant.sessionKey);this.realm(grant.realmId,true);return this.repos.leases.renew(grant.accountId,clientId,this.options.nodeId,this.now(),this.now()+30_000);}
    catch(error){if(!(error instanceof GameError))this.options.logger.failure('play.renew-failed',{accountId:grant.accountId,characterId:grant.characterId});return false;}
  }
  drop(grant:PlayGrant,clientId:string){this.repos.leases.renew(grant.accountId,clientId,this.options.nodeId,this.now(),this.now()+20_000);}
  release(grant:PlayGrant,clientId:string){this.repos.leases.release(grant.accountId,clientId,this.options.nodeId);this.options.logger.event('play.release',{accountId:grant.accountId,characterId:grant.characterId,clientId});}
  admin(auth:Authenticated){if(auth.account.role!=='admin')throw new GameError('admin_required',403,'Tài khoản không có quyền quản trị.');}
  snapshot(auth:Authenticated,offset=0):AdminSnapshot {
    this.admin(auth);if(!Number.isInteger(offset)||offset<0||offset>1_000_000)throw new GameError('invalid',400,'Trang dữ liệu chưa hợp lệ.');
    return {accounts:this.repos.accounts.list(offset,20),characters:this.repos.characters.all(offset,20),realms:this.repos.realms.list(),audit:this.repos.audit.list(offset,20),nextOffset:offset+20};
  }
  changeAccount(auth:Authenticated,id:string,raw:unknown,requestId:string){
    this.admin(auth);const v=object(raw);if(!ownKeys(v,['status'])||!['active','blocked'].includes(String(v.status)))throw new GameError('invalid',400,'Trạng thái tài khoản chưa hợp lệ.');
    this.repos.transaction(()=>{const target=this.repos.accounts.get(id);if(!target)throw new GameError('account_missing',404,'Không tìm thấy tài khoản.');if(target.role==='admin')throw new GameError('protected_admin',409,'Tài khoản quản trị được bảo vệ khỏi khóa tại màn này.');
      this.repos.accounts.status(id,v.status as GameAccount['status']);if(v.status==='blocked')this.repos.sessions.revokeAccount(id,this.now());this.audit(auth.account.id,'account.status',id,requestId,{status:String(v.status)});
    });this.options.logger.event('admin.account-status',{requestId,accountId:id});
  }
  changeRealm(auth:Authenticated,id:string,raw:unknown,requestId:string,create=false){
    this.admin(auth);const v=object(raw);
    if(!validRealmId(id)||!ownKeys(v,['name','status','characterSlots','creationEnabled'])||typeof v.name!=='string'||[...v.name.trim()].length<2||v.name.length>60||/[<>\u0000-\u001f]/.test(v.name)||!['online','maintenance'].includes(String(v.status))||!Number.isInteger(v.characterSlots)||Number(v.characterSlots)<1||Number(v.characterSlots)>12||typeof v.creationEnabled!=='boolean')throw new GameError('invalid',400,'Thông tin server chưa hợp lệ. Số nhân vật cần từ 1–12.');
    const realm:GameRealm={id,name:v.name.trim(),status:v.status as GameRealm['status'],characterSlots:Number(v.characterSlots),creationEnabled:v.creationEnabled,updatedAt:this.now()};
    this.repos.transaction(()=>{const existing=this.repos.realms.get(id);if(create&&existing)throw new GameError('realm_exists',409,'Mã server đã có.');if(!create&&!existing)throw new GameError('realm_missing',404,'Không tìm thấy server.');if(create)this.repos.realms.insert(realm);else this.repos.realms.update(realm);this.audit(auth.account.id,create?'realm.create':'realm.update',id,requestId,{status:realm.status,characterSlots:realm.characterSlots,creationEnabled:realm.creationEnabled});});
    this.options.logger.event('admin.realm-change',{requestId,accountId:auth.account.id,realmId:id});return realm;
  }
  async bootstrapAdmin(login:string,password:string){
    if(!validLogin(login)||!this.adminPassword(password))throw new Error('Bootstrap admin credentials do not meet configured limits.');
    const key=normalizeLogin(login),existing=this.repos.accounts.find(key);if(existing){if(existing.role!=='admin')throw new Error('Bootstrap admin login belongs to a player; refusing elevation.');return;}
    const value:AccountRecord={id:this.options.identity.id(),login:key,passwordHash:await this.options.passwords.hash(password),role:'admin',status:'active',createdAt:this.now()};
    this.repos.transaction(()=>{this.repos.accounts.insert(value);this.audit(value.id,'admin.bootstrap',value.id,'bootstrap');});this.options.logger.event('admin.bootstrap',{accountId:value.id});
  }
}
