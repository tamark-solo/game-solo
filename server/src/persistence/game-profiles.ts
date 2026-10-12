import type {CharacterProfile} from '../../../shared/profiles';
import type {ProfilePersistence,GameLogger} from '../core/ports';
import type {GameConnection} from './game-connection';

export class SqliteGameProfiles implements ProfilePersistence {
  constructor(private connection:GameConnection,private logger?:GameLogger){}
  save(profile:CharacterProfile){
    const revision=profile.revision+1,updatedAt=Date.now();
    try{const result=this.connection.db.prepare('UPDATE game_characters SET data=?,revision=?,updated_at=? WHERE id=? AND account_id=? AND revision=?')
      .run(JSON.stringify({...profile,revision,updatedAt}),revision,updatedAt,profile.id,profile.accountId,profile.revision);
    if(result.changes!==1)throw new Error('Profile revision conflict; refusing to overwrite a newer save.');
    profile.revision=revision;profile.updatedAt=updatedAt;
    }catch(error){this.logger?.failure('profile.save-failed',{accountId:profile.accountId,characterId:profile.id,code:'save'},error);throw error;}
  }
  private read(profileId:string,kind:string,id:string):unknown|undefined {
    const row=this.connection.db.prepare('SELECT result FROM game_profile_receipts WHERE character_id=? AND kind=? AND request_id=?').get(profileId,kind,id) as {result:string}|undefined;
    return row?JSON.parse(row.result):undefined;
  }
  receipt(profileId:string,id:string){return this.read(profileId,'cast',id);}
  sectReceipt(profileId:string,id:string){return this.read(profileId,'sect',id);}
  characterReceipt(profileId:string,id:string){return this.read(profileId,'inventory',id);}
  private commit(profile:CharacterProfile,kind:string,id:string,result:unknown){
    const revision=profile.revision,updatedAt=profile.updatedAt;
    try{this.connection.transaction(()=>{
      this.connection.db.prepare('INSERT INTO game_profile_receipts VALUES(?,?,?,?)').run(profile.id,kind,id,JSON.stringify(result));this.save(profile);
    });}catch(error){profile.revision=revision;profile.updatedAt=updatedAt;this.logger?.failure('profile.commit-failed',{accountId:profile.accountId,characterId:profile.id,requestId:id,code:kind},error);throw error;}
  }
  commitCast(profile:CharacterProfile,id:string,result:unknown){this.commit(profile,'cast',id,result);}
  commitSect(profile:CharacterProfile,id:string,result:unknown){this.commit(profile,'sect',id,result);}
  commitCharacter(profile:CharacterProfile,id:string,result:unknown){this.commit(profile,'inventory',id,result);}
}
