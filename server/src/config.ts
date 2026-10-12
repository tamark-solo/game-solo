const port = Number(process.env.PORT ?? 2567);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT không hợp lệ.');

export const serverConfig = {
  port,
  host: process.env.HOST ?? '127.0.0.1',
  transport: { maxPayload: 8192, pingInterval: 3000 },
};

const production=process.env.NODE_ENV==='production';
const originValues=(process.env.GAME_ALLOWED_ORIGINS??'').split(',').map(value=>value.trim()).filter(Boolean);
for(const origin of originValues){if(new URL(origin).origin!==origin||(production&&!origin.startsWith('https://')))throw new Error('GAME_ALLOWED_ORIGINS must contain explicit origins (HTTPS in production).');}
if(production&&!originValues.length)throw new Error('GAME_ALLOWED_ORIGINS is required in production.');
export const gameHttpConfig={secureCookie:production||process.env.GAME_COOKIE_SECURE==='1',cookieName:production?'__Host-game_session':`game_session_${port}`,
  allowsOrigin:(origin:string)=>originValues.length?originValues.includes(origin):/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin),
  allowGuest:!production&&process.env.GAME_ALLOW_GUEST!=='0'};

export const courtyardLimits = {
  maxClients: 20, // A test-room limit, not a measured MMO capacity.
  maxMessagesPerSecond: 90,
  inputBufferSize: 64,
  reconnectSeconds: 15,
};
