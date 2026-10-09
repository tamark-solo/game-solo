import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { CourtyardRoom, ROOM_NAME, TICK_MS } from './CourtyardRoom';
import { HangNhacRoom } from './HangNhacRoom';
import { HANG_NHAC, HANG_NHAC_ROOM } from '../../shared/hang-nhac';
import { resolve } from 'node:path';
import { ProfileStore, ProfileLeases } from './profile-store';
import { installProfileApi } from './profile-api';

const port = Number(process.env.PORT ?? 2567);
const host = process.env.HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT không hợp lệ.');
const profiles = new ProfileStore(process.env.GAME_DB_PATH ?? resolve('server/data/profiles.sqlite'));
HangNhacRoom.configure(profiles, new ProfileLeases());
const server = new Server({
  transport: new WebSocketTransport({ maxPayload: 8192, pingInterval: 3000 }),
  express: app => {
    installProfileApi(app, profiles);
    app.get('/health', (_req: unknown, res: { json(body: unknown): void }) => res.json({ ok: true, room: ROOM_NAME,
      rooms: [ROOM_NAME, HANG_NHAC_ROOM], map: { id: HANG_NHAC.id, version: HANG_NHAC.version }, tickMs: TICK_MS,
      persistence: { sect_courtyard: 'memory_only', hang_nhac: 'sqlite_guest_profiles' } }));
  },
});
server.define(ROOM_NAME, CourtyardRoom);
server.define(HANG_NHAC_ROOM, HangNhacRoom);
await server.listen(port, host);
console.log(`Backend preview: http://${host}:${port} · ${TICK_MS} ms/tick · Hằng Nhạc lưu hồ sơ thử tại server.`);
