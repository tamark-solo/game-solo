import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';

export class GameConnection {
  readonly db:DatabaseSync;
  constructor(path:string){
    if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
    this.db=new DatabaseSync(path);
    this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;');
    this.db.exec('CREATE TABLE IF NOT EXISTS game_migrations(version INTEGER PRIMARY KEY,applied_at INTEGER NOT NULL);');
    if(Number(this.db.prepare('SELECT coalesce(max(version),0) AS version FROM game_migrations').get()!.version)>1){this.db.close();throw new Error('Game database uses a newer schema.');}
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_migrations(version INTEGER PRIMARY KEY,applied_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS game_accounts(id TEXT PRIMARY KEY,login TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('player','admin')),status TEXT NOT NULL CHECK(status IN ('active','blocked')),created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS game_sessions(key TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES game_accounts(id),csrf TEXT NOT NULL,created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,touched_at INTEGER NOT NULL,revoked_at INTEGER);
      CREATE INDEX IF NOT EXISTS game_sessions_owner ON game_sessions(account_id,expires_at);
      CREATE TABLE IF NOT EXISTS game_realms(id TEXT PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('online','maintenance')),character_slots INTEGER NOT NULL CHECK(character_slots BETWEEN 1 AND 12),creation_enabled INTEGER NOT NULL CHECK(creation_enabled IN (0,1)),updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS game_characters(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES game_accounts(id),realm_id TEXT NOT NULL REFERENCES game_realms(id),avatar_id TEXT NOT NULL,name_key TEXT NOT NULL,data TEXT NOT NULL,revision INTEGER NOT NULL,updated_at INTEGER NOT NULL,UNIQUE(realm_id,name_key));
      CREATE INDEX IF NOT EXISTS game_characters_owner ON game_characters(account_id,realm_id);
      CREATE TABLE IF NOT EXISTS game_create_receipts(account_id TEXT NOT NULL REFERENCES game_accounts(id),request_id TEXT NOT NULL,fingerprint TEXT NOT NULL,character_id TEXT NOT NULL REFERENCES game_characters(id),PRIMARY KEY(account_id,request_id));
      CREATE TABLE IF NOT EXISTS game_profile_receipts(character_id TEXT NOT NULL REFERENCES game_characters(id),kind TEXT NOT NULL CHECK(kind IN ('cast','sect','inventory')),request_id TEXT NOT NULL,result TEXT NOT NULL,PRIMARY KEY(character_id,kind,request_id));
      CREATE TABLE IF NOT EXISTS game_play_tickets(key TEXT PRIMARY KEY,session_key TEXT NOT NULL REFERENCES game_sessions(key),account_id TEXT NOT NULL REFERENCES game_accounts(id),realm_id TEXT NOT NULL REFERENCES game_realms(id),character_id TEXT NOT NULL REFERENCES game_characters(id),expires_at INTEGER NOT NULL,consumed_at INTEGER);
      CREATE TABLE IF NOT EXISTS game_play_leases(account_id TEXT PRIMARY KEY REFERENCES game_accounts(id),character_id TEXT NOT NULL UNIQUE REFERENCES game_characters(id),client_id TEXT NOT NULL,node_id TEXT NOT NULL,expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS game_rate_windows(key TEXT PRIMARY KEY,started_at INTEGER NOT NULL,hits INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS game_audit(id INTEGER PRIMARY KEY AUTOINCREMENT,at INTEGER NOT NULL,actor_id TEXT NOT NULL,action TEXT NOT NULL,target_id TEXT NOT NULL,request_id TEXT NOT NULL,detail TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS game_audit_time ON game_audit(at);
      INSERT OR IGNORE INTO game_migrations VALUES(1,CAST(strftime('%s','now') AS INTEGER)*1000);
    `);
  }
  transaction<T>(action:()=>T):T{
    this.db.exec('BEGIN IMMEDIATE');
    try{const result=action();this.db.exec('COMMIT');return result;}catch(error){this.db.exec('ROLLBACK');throw error;}
  }
  probe(){this.db.prepare('SELECT 1').get();}
  close(){this.db.close();}
}
