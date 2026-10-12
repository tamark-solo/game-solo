import type {GameRepositories,TicketRecord} from '../core/ports';
import type {GameConnection} from './game-connection';

export function runtimeRepositories(connection:GameConnection):Pick<GameRepositories,'tickets'|'leases'|'rates'|'audit'> {
  const {db}=connection;
  return {
    tickets:{
      get:key=>{const r=db.prepare('SELECT * FROM game_play_tickets WHERE key=?').get(key);return r?{key:String(r.key),sessionKey:String(r.session_key),accountId:String(r.account_id),realmId:String(r.realm_id),characterId:String(r.character_id),expiresAt:Number(r.expires_at),consumedAt:r.consumed_at===null?null:Number(r.consumed_at)}:undefined;},
      insert:(v:TicketRecord)=>{db.prepare('INSERT INTO game_play_tickets VALUES(?,?,?,?,?,?,?)').run(v.key,v.sessionKey,v.accountId,v.realmId,v.characterId,v.expiresAt,v.consumedAt);},
      consume:(key,now)=>db.prepare('UPDATE game_play_tickets SET consumed_at=? WHERE key=? AND consumed_at IS NULL AND expires_at>?').run(now,key,now).changes===1,
    },
    leases:{
      acquire:(accountId,characterId,clientId,nodeId,now,until)=>{
        const result=db.prepare(`INSERT INTO game_play_leases VALUES(?,?,?,?,?) ON CONFLICT(account_id) DO UPDATE SET character_id=excluded.character_id,client_id=excluded.client_id,node_id=excluded.node_id,expires_at=excluded.expires_at WHERE game_play_leases.expires_at<=? OR (game_play_leases.client_id=? AND game_play_leases.node_id=? AND game_play_leases.character_id=?)`).run(accountId,characterId,clientId,nodeId,until,now,clientId,nodeId,characterId);
        return result.changes===1;
      },
      renew:(accountId,clientId,nodeId,now,until)=>db.prepare('UPDATE game_play_leases SET expires_at=? WHERE account_id=? AND client_id=? AND node_id=? AND expires_at>?').run(until,accountId,clientId,nodeId,now).changes===1,
      release:(accountId,clientId,nodeId)=>{db.prepare('DELETE FROM game_play_leases WHERE account_id=? AND client_id=? AND node_id=?').run(accountId,clientId,nodeId);},
      recoverNode:nodeId=>{db.prepare('DELETE FROM game_play_leases WHERE node_id=?').run(nodeId);},
      count:now=>Number(db.prepare('SELECT count(*) AS n FROM game_play_leases WHERE expires_at>?').get(now)!.n),
    },
    rates:{consume:(key,now,windowMs,limit)=>connection.transaction(()=>{
      const row=db.prepare('SELECT * FROM game_rate_windows WHERE key=?').get(key);
      if(!row||Number(row.started_at)+windowMs<=now){db.prepare('INSERT INTO game_rate_windows VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET started_at=excluded.started_at,hits=1').run(key,now);return true;}
      if(Number(row.hits)>=limit)return false;db.prepare('UPDATE game_rate_windows SET hits=hits+1 WHERE key=?').run(key);return true;
    })},
    audit:{
      append:v=>{db.prepare('INSERT INTO game_audit(at,actor_id,action,target_id,request_id,detail) VALUES(?,?,?,?,?,?)').run(v.at,v.actorId,v.action,v.targetId,v.requestId,JSON.stringify(v.detail));},
      list:(offset,limit)=>db.prepare('SELECT * FROM game_audit ORDER BY id DESC LIMIT ? OFFSET ?').all(limit,offset).map(r=>({id:Number(r.id),at:Number(r.at),actorId:String(r.actor_id),action:String(r.action),targetId:String(r.target_id),requestId:String(r.request_id),detail:JSON.parse(String(r.detail))})),
    },
  };
}
