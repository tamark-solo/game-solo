import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { CourtyardRoom, ROOM_NAME, TICK_MS } from './CourtyardRoom';

const port = Number(process.env.PORT ?? 2567);
const host = process.env.HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT không hợp lệ.');
const server = new Server({
  transport: new WebSocketTransport({ maxPayload: 8192, pingInterval: 3000 }),
  express: app => {
    app.get('/health', (_req: unknown, res: { json(body: unknown): void }) => res.json({ ok: true, room: ROOM_NAME, tickMs: TICK_MS, persistence: 'memory_only' }));
  },
});
server.define(ROOM_NAME, CourtyardRoom);
await server.listen(port, host);
console.log(`Backend preview: http://${host}:${port} · ${TICK_MS} ms/tick · phiên thử, chưa lưu tiến trình.`);
