import type {AvatarId} from '../../../shared/profiles';
import type {EntryPhase,GameSessionView,RealmView,RealmCharacter} from '../../../shared/game/entry';

export interface EntrySprite {url:string;atlasWidth:number;atlasHeight:number;frame:{x:number;y:number;w:number;h:number}}
export interface GameEntryState {
  phase:EntryPhase;session?:GameSessionView;realms:RealmView[];realmId:string;characters:RealmCharacter[];selectedId:string;
  creatingAvatar:AvatarId;draftName:string;loginMode:'login'|'register';busy:boolean;message:string;requestId:string;
  sprites:Partial<Record<AvatarId,EntrySprite>>;
}
export function createGameEntryState():GameEntryState{return {phase:'title',realms:[],realmId:'',characters:[],selectedId:'',creatingAvatar:'CHR-WANG-LIN-CHIBI',draftName:'',loginMode:'login',busy:false,message:'',requestId:'',sprites:{}};}
