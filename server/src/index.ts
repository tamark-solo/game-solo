import { Server,matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { resolve } from 'node:path';
import { HANG_NHAC_ROOM } from '@shared/hang-nhac';
import { ROOM_NAME, TICK_MS } from '@shared/protocol/constants';
import { serverConfig,gameHttpConfig } from './config';
import { health } from './http/health';
import { CourtyardRoom } from './rooms/courtyard/room';
import { HangNhacRoom } from './HangNhacRoom';
import { ProfileStore, ProfileLeases } from './profile-store';
import { installProfileApi } from './profile-api';
import { installGameApi } from './http/game/routes';
import { createGameRuntime } from './game-runtime';

const { host, port } = serverConfig;
// Colyseus handles OPTIONS before Express; share the same origin/header policy.
matchMaker.controller.getCorsHeaders=headers=>({
  'Access-Control-Allow-Origin':headers.get('origin')&&gameHttpConfig.allowsOrigin(headers.get('origin')!)?headers.get('origin')!:'',
  'Access-Control-Allow-Headers':'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-Game-CSRF,X-Game-Client,X-Request-Id',
  'Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS',
  'Access-Control-Max-Age':'600',
  'Vary':'Origin',
});
const profiles = new ProfileStore(process.env.GAME_DB_PATH ?? resolve('server/data/profiles.sqlite'));
const game=await createGameRuntime();
HangNhacRoom.configure(profiles, new ProfileLeases(),game.service,gameHttpConfig.allowGuest);
const server = new Server({
  transport: new WebSocketTransport(serverConfig.transport),
  express: app => {
    installGameApi(app,{service:game.service,catalog:game.catalog,logger:game.observer,...gameHttpConfig,operationalStatus:game.status});
    if(gameHttpConfig.allowGuest)installProfileApi(app, profiles);
    app.get('/health', health);
    app.get('/ready',(_req,res)=>{try{game.ready();res.json({ok:true,entry:'accounts-realms-characters'});}catch{res.status(503).json({ok:false});}});
  },
});
if(gameHttpConfig.allowGuest)server.define(ROOM_NAME, CourtyardRoom);
server.define(HANG_NHAC_ROOM, HangNhacRoom).filterBy(['realmId']);
server.onShutdown(()=>{game.dispose();profiles.close();});
await server.listen(port, host);
console.log(`Backend preview: http://${host}:${port} · ${TICK_MS} ms/tick · Hằng Nhạc lưu hồ sơ thử tại server.`);
