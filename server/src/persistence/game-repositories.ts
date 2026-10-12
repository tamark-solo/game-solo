import type {GameRepositories,GameLogger} from '../core/ports';
import {GameConnection} from './game-connection';
import {identityRepositories} from './game-identity';
import {realmRepository} from './game-realms';
import {characterRepository} from './game-characters';
import {runtimeRepositories} from './game-runtime';
import {SqliteGameProfiles} from './game-profiles';

export function sqliteGameRepositories(connection:GameConnection,logger?:GameLogger):GameRepositories {
  return {...identityRepositories(connection),realms:realmRepository(connection),characters:characterRepository(connection),...runtimeRepositories(connection),
    transaction:fn=>connection.transaction(fn),profiles:new SqliteGameProfiles(connection,logger),probe:()=>connection.probe(),
    prune:now=>connection.transaction(()=>{
      connection.db.prepare('DELETE FROM game_play_tickets WHERE expires_at<?').run(now-60_000);
      connection.db.prepare('DELETE FROM game_sessions WHERE (expires_at<? OR revoked_at<?) AND key NOT IN (SELECT session_key FROM game_play_tickets)').run(now-86400_000,now-86400_000);
      connection.db.prepare('DELETE FROM game_rate_windows WHERE started_at<?').run(now-86400_000);
      connection.db.prepare('DELETE FROM game_play_leases WHERE expires_at<?').run(now-60_000);
    }),
  };
}
