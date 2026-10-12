import type {GameEntryState} from '../../core/game-entry-state';
import type {GameApi} from '../../net/game-api';
import type {AvatarId,PublicProfile} from '../../../../shared/profiles';
import {HANG_NHAC} from '../../../../shared/hang-nhac';

const ACTIVE='tien-nghich.active-character.v1';
export interface ActiveCharacter {accountId:string;characterId:string;realmId:string;avatarId:AvatarId;reconnectionToken:string}
export function readActiveCharacter():ActiveCharacter|undefined {
  try{const value=JSON.parse(sessionStorage.getItem(ACTIVE)??'null');return value&&['accountId','characterId','realmId','avatarId','reconnectionToken'].every(key=>typeof value[key]==='string')?value:undefined;}catch{return;}
}
// Selected registered profile; never creates a guest or chooses by avatar identity.
export class EntryProfiles {
  readonly token='';
  constructor(private state:GameEntryState,private api:GameApi){}
  get selected(){return this.state.characters.find(value=>value.profile.id===this.state.selectedId);}
  get profiles():PublicProfile[]{return this.selected?[this.selected.profile]:[];}
  async open(){this.state.session=await this.api.session();await this.refresh();if(!this.selected)throw new Error('Chọn một nhân vật đã tạo trước khi vào game.');}
  async refresh(){if(this.state.session&&this.state.realmId)this.state.characters=await this.api.characters(this.state.realmId);}
  async joinOptions(){
    const selected=this.selected;if(!selected)throw new Error('Chọn nhân vật trước khi vào game.');
    const value=await this.api.ticket(selected.realmId,selected.profile.id);
    return {entryTicket:value.ticket,realmId:value.realmId,characterId:value.characterId,mapVersion:HANG_NHAC.version};
  }
  remember(avatarId:AvatarId,reconnectionToken:string){if(!this.selected||!this.state.session)return;const value:ActiveCharacter={accountId:this.state.session.account.id,characterId:this.selected.profile.id,realmId:this.selected.realmId,avatarId,reconnectionToken};sessionStorage.setItem(ACTIVE,JSON.stringify(value));}
  active(){const value=readActiveCharacter();return value&&value.accountId===this.state.session?.account.id&&value.characterId===this.selected?.profile.id&&value.realmId===this.state.realmId?{avatarId:value.avatarId,reconnectionToken:value.reconnectionToken}:undefined;}
  clearActive(){sessionStorage.removeItem(ACTIVE);}
}
