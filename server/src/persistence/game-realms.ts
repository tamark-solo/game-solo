import type {GameRepositories} from '../core/ports';
import type {GameRealm} from '../../../shared/game/entry';
import type {GameConnection} from './game-connection';
export function realmRepository({db}:GameConnection):GameRepositories['realms'] {
  const decode=(r:Record<string,unknown>):GameRealm=>({id:String(r.id),name:String(r.name),status:r.status as GameRealm['status'],characterSlots:Number(r.character_slots),creationEnabled:r.creation_enabled===1,updatedAt:Number(r.updated_at)});
  return {get:id=>{const row=db.prepare('SELECT * FROM game_realms WHERE id=?').get(id);return row?decode(row):undefined;},list:()=>db.prepare('SELECT * FROM game_realms ORDER BY id').all().map(decode),
    insert:v=>{db.prepare('INSERT INTO game_realms VALUES(?,?,?,?,?,?)').run(v.id,v.name,v.status,v.characterSlots,Number(v.creationEnabled),v.updatedAt);},
    update:v=>{db.prepare('UPDATE game_realms SET name=?,status=?,character_slots=?,creation_enabled=?,updated_at=? WHERE id=?').run(v.name,v.status,v.characterSlots,Number(v.creationEnabled),v.updatedAt,v.id);}};
}
