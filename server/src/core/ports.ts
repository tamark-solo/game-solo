import type { AvatarId, CharacterProfile } from '../../../shared/profiles';
import type { GameAccount, GameRealm, AuditEntry, RealmCharacter,AdminCharacter } from '../../../shared/game/entry';

export interface ProfilePersistence {
  save(profile:CharacterProfile):void;
  receipt(profileId:string,id:string):unknown|undefined;
  sectReceipt(profileId:string,id:string):unknown|undefined;
  characterReceipt(profileId:string,id:string):unknown|undefined;
  commitCast(profile:CharacterProfile,id:string,result:unknown):void;
  commitSect(profile:CharacterProfile,id:string,result:unknown):void;
  commitCharacter(profile:CharacterProfile,id:string,result:unknown):void;
}
export interface AccountRecord extends GameAccount { passwordHash:string }
export interface SessionRecord { key:string; accountId:string; csrf:string; createdAt:number; expiresAt:number; touchedAt:number; revokedAt:number|null }
export interface TicketRecord { key:string; sessionKey:string; accountId:string; realmId:string; characterId:string; expiresAt:number; consumedAt:number|null }
export interface CharacterRow { id:string; accountId:string; realmId:string; avatarId:AvatarId; nameKey:string; profile:CharacterProfile }
export interface CharacterReceipt { fingerprint:string; characterId:string }
export interface PlayGrant { accountId:string; sessionKey:string; characterId:string; realmId:string; profile:CharacterProfile; persistence:ProfilePersistence }
export interface PlayGateway {
  claim(ticket:unknown,realmId:unknown,clientId:string):PlayGrant;
  renew(grant:PlayGrant,clientId:string):boolean;
  drop(grant:PlayGrant,clientId:string):void;
  release(grant:PlayGrant,clientId:string):void;
}
export interface GameRepositories {
  transaction<T>(fn:()=>T):T;
  accounts:{find(login:string):AccountRecord|undefined;get(id:string):AccountRecord|undefined;insert(value:AccountRecord):void;status(id:string,status:GameAccount['status']):void;list(offset:number,limit:number):GameAccount[]};
  sessions:{get(key:string):SessionRecord|undefined;insert(value:SessionRecord):void;touch(key:string,now:number):void;revoke(key:string,now:number):void;revokeAccount(accountId:string,now:number):void};
  realms:{get(id:string):GameRealm|undefined;list():GameRealm[];insert(value:GameRealm):void;update(value:GameRealm):void};
  characters:{get(id:string):CharacterRow|undefined;list(accountId:string,realmId:string):RealmCharacter[];all(offset:number,limit:number):AdminCharacter[];count(accountId:string,realmId:string):number;named(realmId:string,nameKey:string):boolean;insert(value:CharacterRow):void;receipt(accountId:string,id:string):CharacterReceipt|undefined;record(accountId:string,id:string,value:CharacterReceipt):void};
  tickets:{get(key:string):TicketRecord|undefined;insert(value:TicketRecord):void;consume(key:string,now:number):boolean};
  leases:{acquire(accountId:string,characterId:string,clientId:string,nodeId:string,now:number,until:number):boolean;renew(accountId:string,clientId:string,nodeId:string,now:number,until:number):boolean;release(accountId:string,clientId:string,nodeId:string):void;recoverNode(nodeId:string):void;count(now:number):number};
  rates:{consume(key:string,now:number,windowMs:number,limit:number):boolean};
  audit:{append(value:Omit<AuditEntry,'id'>):void;list(offset:number,limit:number):AuditEntry[]};
  profiles:ProfilePersistence;
  probe():void;
  prune(now:number):void;
}
export interface PasswordHasher { hash(password:string):Promise<string>;verify(password:string,encoded:string|undefined):Promise<boolean> }
export interface IdentitySource { id():string;secret():string;digest(value:string):string }
export interface GameLogger { event(event:string,fields?:Record<string,string|number|boolean>):void;failure(event:string,fields?:Record<string,string|number|boolean>,error?:unknown):void }
