import type { AvatarId, PublicProfile } from '../profiles';

export type AccountRole = 'player' | 'admin';
export type AccountStatus = 'active' | 'blocked';
export type RealmStatus = 'online' | 'maintenance';
export interface GameAccount { id:string; login:string; role:AccountRole; status:AccountStatus; createdAt:number }
export interface GameRealm { id:string; name:string; status:RealmStatus; characterSlots:number; creationEnabled:boolean; updatedAt:number }
export interface RealmView extends GameRealm { characters:number }
export interface RealmCharacter { realmId:string; profile:PublicProfile }
export interface GameSessionView { account:GameAccount; csrf:string; expiresAt:number }
export interface PlayTicketView { ticket:string; realmId:string; characterId:string; avatarId:AvatarId; mapVersion:string; expiresAt:number }
export interface GameApiError { code:string; message:string; requestId:string }
export interface CharacterCreate { requestId:string; realmId:string; avatarId:AvatarId; name:string }
export interface AuditEntry { id:number; at:number; actorId:string; action:string; targetId:string; requestId:string; detail:Record<string,string|number|boolean> }
export interface AdminCharacter extends RealmCharacter {accountId:string}
export interface AdminSnapshot { accounts:GameAccount[]; characters:AdminCharacter[]; realms:GameRealm[]; audit:AuditEntry[]; nextOffset:number }

export const ENTRY_LIMITS={loginMin:3,loginMax:32,passwordMin:12,passwordMax:128,nameMin:2,nameMax:24,realmSlotsMax:12} as const;
export const normalizeLogin=(value:string)=>value.normalize('NFKC').trim().toLowerCase();
export const validLogin=(value:unknown):value is string=>typeof value==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,31}$/.test(value);
export const validPassword=(value:unknown):value is string=>typeof value==='string'&&value.length>=12&&value.length<=128&&!value.includes('\0');
export const normalizeCharacterName=(value:string)=>value.normalize('NFC').trim().replace(/\s+/gu,' ');
export const characterNameKey=(value:string)=>normalizeCharacterName(value).normalize('NFKC').toLocaleLowerCase('vi');
export function validCharacterName(value:unknown):value is string {
  if(typeof value!=='string')return false;
  const name=normalizeCharacterName(value),length=[...name].length;
  return length>=2&&length<=24&&/^[\p{L}\p{N}][\p{L}\p{M}\p{N} _-]*$/u.test(name);
}
export const validRequestId=(value:unknown):value is string=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value);
export const validRealmId=(value:unknown):value is string=>typeof value==='string'&&/^[a-z0-9][a-z0-9-]{0,39}$/.test(value);

export type EntryPhase='title'|'loading'|'login'|'realms'|'characters'|'create'|'entering'|'playing';
export function entryPhase(input:{loading:boolean;authenticated:boolean;realm:boolean;creating:boolean;entering:boolean;playing:boolean;started?:boolean}):EntryPhase {
  if(!input.loading&&input.started===false)return 'title';
  if(input.loading)return 'loading';if(!input.authenticated)return 'login';if(input.playing)return 'playing';if(input.entering)return 'entering';
  if(!input.realm)return 'realms';return input.creating?'create':'characters';
}
