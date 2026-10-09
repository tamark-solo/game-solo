import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { CHARACTER_INFO, R01_IDS, initialProfile, isAvatarId, publicProfile, type AvatarId, type CharacterProfile } from '../../shared/profiles';
import { HANG_NHAC_AVATARS } from '../../shared/hang-nhac';
import { initialSectProgress, validSectProgress } from '../../shared/sect';
import { initialLessonProgress } from '../../shared/lesson-contracts';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export class ProfileStore {
  private db: DatabaseSync;
  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;');
    const version = this.db.prepare('PRAGMA user_version').get() as { user_version: number };
    if (version.user_version > 2) throw new Error('Profile database uses a newer schema.');
    this.db.exec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), avatar_id TEXT NOT NULL,
        data TEXT NOT NULL, revision INTEGER NOT NULL, UNIQUE(account_id,avatar_id));
      CREATE TABLE IF NOT EXISTS cast_receipts (profile_id TEXT NOT NULL REFERENCES profiles(id), request_id TEXT NOT NULL, result TEXT NOT NULL,
        PRIMARY KEY(profile_id,request_id));
      CREATE TABLE IF NOT EXISTS sect_receipts (profile_id TEXT NOT NULL REFERENCES profiles(id), request_id TEXT NOT NULL, result TEXT NOT NULL,
        PRIMARY KEY(profile_id,request_id)); PRAGMA user_version=2;`);
  }
  createGuest(): { token: string; accountId: string } {
    const token = randomBytes(32).toString('base64url'), accountId = randomUUID(), now = Date.now();
    this.transaction(() => {
      this.db.prepare('INSERT INTO accounts VALUES(?,?,?)').run(accountId, hashToken(token), now);
      for (const avatarId of HANG_NHAC_AVATARS) {
        const profile = initialProfile(randomUUID(), accountId, avatarId, now);
        this.db.prepare('INSERT INTO profiles VALUES(?,?,?,?,?)').run(profile.id, accountId, avatarId, JSON.stringify(profile), 0);
      }
    });
    return { token, accountId };
  }
  authenticate(token: unknown): string | undefined {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return undefined;
    return (this.db.prepare('SELECT id FROM accounts WHERE token_hash=?').get(hashToken(token)) as { id: string } | undefined)?.id;
  }
  get(accountId: string, avatarId: AvatarId): CharacterProfile {
    const row = this.db.prepare('SELECT id,data,revision FROM profiles WHERE account_id=? AND avatar_id=?').get(accountId, avatarId) as { id:string;data: string;revision:number } | undefined;
    if (!row) throw new Error('Profile does not belong to this account.');
    const raw = JSON.parse(row.data) as Omit<CharacterProfile,'schema'> & {schema:number};
    if (![1,2].includes(raw.schema)) throw new Error('Saved profile failed validation.');
    const p = raw as CharacterProfile;
    if (!isAvatarId(p.avatarId) || p.accountId !== accountId || p.avatarId !== avatarId || p.id!==row.id || p.revision!==row.revision ||
        ![p.x,p.y,p.hp,p.mp,p.casts,p.practiceHits,p.revision,p.nextSwordAt,p.nextThunderAt,p.nextWindAt,p.lastSpentAt,p.createdAt,p.updatedAt].every(Number.isFinite) ||
        p.hp<0 || p.hp>100 || p.mp<0 || p.mp>100 || ![p.casts,p.practiceHits,p.revision,p.cultivation].every(n=>Number.isInteger(n)&&n>=0) ||
        !Array.isArray(p.skills) || p.skills.length!==3 || !R01_IDS.every(id=>p.skills.includes(id)) ||
        (raw.schema===1 ? p.milestone!=='introduction' : !validSectProgress(p.sect,p)) ||
        p.progressionKind!==CHARACTER_INFO[avatarId].progressionKind || typeof p.name!=='string' || typeof p.mapId!=='string' || typeof p.mapVersion!=='string')
      throw new Error('Saved profile failed validation.');
    // Upgrade old JSON lazily. Its identity, coordinates, R01, receipts and resources survive.
    return raw.schema===1 ? {...p,schema:2,sect:initialSectProgress()} :
      {...p,sect:{...p.sect,lessons:p.sect.lessons??initialLessonProgress()}};
  }
  list(accountId: string) { return HANG_NHAC_AVATARS.map(id => publicProfile(this.get(accountId, id))); }
  save(profile: CharacterProfile): void {
    const revision = profile.revision + 1, updatedAt = Date.now();
    const data = JSON.stringify({ ...profile, revision, updatedAt });
    const result = this.db.prepare('UPDATE profiles SET data=?,revision=? WHERE id=? AND account_id=? AND revision=?')
      .run(data, revision, profile.id, profile.accountId, profile.revision);
    if (result.changes !== 1) throw new Error('Profile revision conflict; refusing to overwrite a newer save.');
    profile.revision = revision; profile.updatedAt = updatedAt;
  }
  receipt(profileId: string, requestId: string): unknown | undefined {
    const row = this.db.prepare('SELECT result FROM cast_receipts WHERE profile_id=? AND request_id=?').get(profileId, requestId) as { result: string } | undefined;
    return row ? JSON.parse(row.result) : undefined;
  }
  commitCast(profile: CharacterProfile, requestId: string, result: unknown): void {
    this.commitReceipt('cast_receipts',profile,requestId,result);
  }
  sectReceipt(profileId:string,requestId:string):unknown|undefined {
    const row=this.db.prepare('SELECT result FROM sect_receipts WHERE profile_id=? AND request_id=?').get(profileId,requestId) as {result:string}|undefined;
    return row?JSON.parse(row.result):undefined;
  }
  commitSect(profile:CharacterProfile,requestId:string,result:unknown):void {
    this.commitReceipt('sect_receipts',profile,requestId,result);
  }
  private commitReceipt(table:'cast_receipts'|'sect_receipts',profile:CharacterProfile,requestId:string,result:unknown):void {
    const revision = profile.revision, updatedAt = profile.updatedAt;
    try {
      this.transaction(() => {
        this.db.prepare(`INSERT INTO ${table} VALUES(?,?,?)`).run(profile.id, requestId, JSON.stringify(result));
        this.save(profile);
      });
    } catch (error) { profile.revision = revision; profile.updatedAt = updatedAt; throw error; }
  }
  private transaction<T>(action: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = action(); this.db.exec('COMMIT'); return result; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  close(): void { this.db.close(); }
}

export class ProfileLeases {
  private leases = new Map<string, { sessionId: string; expiresAt: number }>();
  acquire(accountId: string, sessionId: string, now = Date.now()): boolean {
    const current = this.leases.get(accountId);
    if (current && current.sessionId !== sessionId && current.expiresAt > now) return false;
    this.leases.set(accountId, { sessionId, expiresAt: now + 12_000 }); return true;
  }
  activate(accountId: string, sessionId: string): void { this.extend(accountId, sessionId, Infinity); }
  dropped(accountId: string, sessionId: string): void { this.extend(accountId, sessionId, Date.now() + 15_000); }
  release(accountId: string, sessionId: string): void {
    if (this.leases.get(accountId)?.sessionId === sessionId) this.leases.delete(accountId);
  }
  private extend(accountId: string, sessionId: string, expiresAt: number): void {
    if (this.leases.get(accountId)?.sessionId === sessionId) this.leases.set(accountId, { sessionId, expiresAt });
  }
}
