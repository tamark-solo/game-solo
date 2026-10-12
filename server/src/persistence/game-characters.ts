import {publicProfile,type AvatarId} from '../../../shared/profiles';
import type {GameRepositories,CharacterRow} from '../core/ports';
import type {GameConnection} from './game-connection';
import {decodeProfile} from './profile-codec';
export function characterRepository({db}:GameConnection):GameRepositories['characters'] {
  const decode=(r:Record<string,unknown>):CharacterRow=>({id:String(r.id),accountId:String(r.account_id),realmId:String(r.realm_id),avatarId:r.avatar_id as AvatarId,nameKey:String(r.name_key),
    profile:decodeProfile(String(r.data),{id:String(r.id),accountId:String(r.account_id),avatarId:r.avatar_id as AvatarId,revision:Number(r.revision)})});
  const view=(r:Record<string,unknown>)=>{const row=decode(r);return {realmId:row.realmId,profile:publicProfile(row.profile)};};
  return {
    get:id=>{const row=db.prepare('SELECT * FROM game_characters WHERE id=?').get(id);return row?decode(row):undefined;},
    list:(accountId,realmId)=>db.prepare('SELECT * FROM game_characters WHERE account_id=? AND realm_id=? ORDER BY rowid').all(accountId,realmId).map(view),
    all:(offset,limit)=>db.prepare('SELECT * FROM game_characters ORDER BY rowid DESC LIMIT ? OFFSET ?').all(limit,offset).map(row=>({...view(row),accountId:String(row.account_id)})),
    count:(accountId,realmId)=>Number(db.prepare('SELECT count(*) AS n FROM game_characters WHERE account_id=? AND realm_id=?').get(accountId,realmId)!.n),
    named:(realmId,nameKey)=>!!db.prepare('SELECT id FROM game_characters WHERE realm_id=? AND name_key=?').get(realmId,nameKey),
    insert:v=>{db.prepare('INSERT INTO game_characters VALUES(?,?,?,?,?,?,?,?)').run(v.id,v.accountId,v.realmId,v.avatarId,v.nameKey,JSON.stringify(v.profile),v.profile.revision,v.profile.updatedAt);},
    receipt:(accountId,id)=>{const row=db.prepare('SELECT fingerprint,character_id FROM game_create_receipts WHERE account_id=? AND request_id=?').get(accountId,id);return row?{fingerprint:String(row.fingerprint),characterId:String(row.character_id)}:undefined;},
    record:(accountId,id,v)=>{db.prepare('INSERT INTO game_create_receipts VALUES(?,?,?,?)').run(accountId,id,v.fingerprint,v.characterId);},
  };
}
