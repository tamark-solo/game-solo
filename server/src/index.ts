import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { resolve } from 'node:path';
import { HANG_NHAC_ROOM } from '@shared/hang-nhac';
import { ROOM_NAME, TICK_MS } from '@shared/protocol/constants';
import { serverConfig } from './config';
import { health } from './http/health';
import { CourtyardRoom } from './rooms/courtyard/room';
import { HangNhacRoom } from './HangNhacRoom';
import { ProfileStore, ProfileLeases } from './profile-store';
import { installProfileApi } from './profile-api';

const { host, port } = serverConfig;
const profiles = new ProfileStore(process.env.GAME_DB_PATH ?? resolve('server/data/profiles.sqlite'));
HangNhacRoom.configure(profiles, new ProfileLeases());
const server = new Server({
  transport: new WebSocketTransport(serverConfig.transport),
  express: app => {
    installProfileApi(app, profiles);
    app.get('/health', health);
  },
});
server.define(ROOM_NAME, CourtyardRoom);
server.define(HANG_NHAC_ROOM, HangNhacRoom);
await server.listen(port, host);
console.log(`Backend preview: http://${host}:${port} · ${TICK_MS} ms/tick · Hằng Nhạc lưu hồ sơ thử tại server.`);
