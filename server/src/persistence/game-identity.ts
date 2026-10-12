import type {GameRepositories,AccountRecord,SessionRecord} from '../core/ports';
import type {GameAccount} from '../../../shared/game/entry';
import type {GameConnection} from './game-connection';

export function identityRepositories(connection:GameConnection):Pick<GameRepositories,'accounts'|'sessions'> {
  const {db}=connection;
  const publicAccount=(row:Record<string,unknown>):GameAccount=>({id:String(row.id),login:String(row.login),role:row.role as GameAccount['role'],status:row.status as GameAccount['status'],createdAt:Number(row.created_at)});
  const account=(row:Record<string,unknown>|undefined):AccountRecord|undefined=>row?{...publicAccount(row),passwordHash:String(row.password_hash)}:undefined;
  return {
    accounts:{
      find:login=>account(db.prepare('SELECT * FROM game_accounts WHERE login=?').get(login)),
      get:id=>account(db.prepare('SELECT * FROM game_accounts WHERE id=?').get(id)),
      insert:v=>{db.prepare('INSERT INTO game_accounts VALUES(?,?,?,?,?,?)').run(v.id,v.login,v.passwordHash,v.role,v.status,v.createdAt);},
      status:(id,status)=>{db.prepare('UPDATE game_accounts SET status=? WHERE id=?').run(status,id);},
      list:(offset,limit)=>db.prepare('SELECT id,login,role,status,created_at FROM game_accounts ORDER BY created_at,id LIMIT ? OFFSET ?').all(limit,offset).map(publicAccount),
    },
    sessions:{
      get:key=>{const r=db.prepare('SELECT * FROM game_sessions WHERE key=?').get(key);return r?{key:String(r.key),accountId:String(r.account_id),csrf:String(r.csrf),createdAt:Number(r.created_at),expiresAt:Number(r.expires_at),touchedAt:Number(r.touched_at),revokedAt:r.revoked_at===null?null:Number(r.revoked_at)}:undefined;},
      insert:(v:SessionRecord)=>{db.prepare('INSERT INTO game_sessions VALUES(?,?,?,?,?,?,?)').run(v.key,v.accountId,v.csrf,v.createdAt,v.expiresAt,v.touchedAt,v.revokedAt);},
      touch:(key,now)=>{db.prepare('UPDATE game_sessions SET touched_at=? WHERE key=? AND revoked_at IS NULL').run(now,key);},
      revoke:(key,now)=>{db.prepare('UPDATE game_sessions SET revoked_at=? WHERE key=? AND revoked_at IS NULL').run(now,key);},
      revokeAccount:(accountId,now)=>{db.prepare('UPDATE game_sessions SET revoked_at=? WHERE account_id=? AND revoked_at IS NULL').run(now,accountId);},
    },
  };
}
