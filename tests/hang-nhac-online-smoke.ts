import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { Client, type Room } from '@colyseus/sdk';
import type { CourtyardState } from '../server/src/state';
import { HANG_NHAC, HANG_NHAC_ROOM, HANG_NHAC_AVATARS, hangNhacWalkable, moveInHangNhac } from '../shared/hang-nhac';
import { MoveInput, INPUT_HZ } from '../shared/netcode';
import type { Motion } from '../shared/world';
// @ts-expect-error Shared process helper is JavaScript.
import { startService, waitFor } from './support/services.mjs';

const endpoint = 'http://127.0.0.1:2587';
const service = await startService(['--import', 'tsx', 'server/src/index.ts'], `${endpoint}/health`, { PORT: '2587', GAME_DB_PATH: ':memory:' });
const rooms: Room<CourtyardState>[] = [];
let timer: ReturnType<typeof setInterval> | undefined;
try {
  const client = new Client(endpoint);
  await assert.rejects(client.joinOrCreate(HANG_NHAC_ROOM, { mapVersion: 'stale' }), /auth|4214/i);
  for (const avatarId of HANG_NHAC_AVATARS) rooms.push(await client.joinOrCreate<CourtyardState>(HANG_NHAC_ROOM,
    { name: avatarId, avatarId, mapVersion: HANG_NHAC.version }));
  const [a, b, c] = rooms;
  await waitFor(() => rooms.every(r => r.state.players.size === 3), 'three character appearances in one Hằng Nhạc room');
  assert.ok(rooms.every(r => r.roomId === a.roomId && r.state.mapVersion === HANG_NHAC.version && r.state.mapId === HANG_NHAC.id));
  assert.deepEqual({ x: a.state.players.get(a.sessionId)!.x, y: a.state.players.get(a.sessionId)!.y }, HANG_NHAC.world.spawn);
  assert.deepEqual(rooms.map(r => r.state.players.get(r.sessionId)!.avatarId), [...HANG_NHAC_AVATARS]);
  assert.ok(rooms.every(r => hangNhacWalkable(r.state.players.get(r.sessionId)!)));
  let expected: Motion = { ...HANG_NHAC.world.spawn, direction: 'south', moving: false };
  for (let i = 0; i < 500; i++) expected = moveInHangNhac(expected, { x: 1, y: 0 }, 1 / INPUT_HZ);
  const input = a.input({ type: MoveInput }); assert.equal(input.tickRate, INPUT_HZ);
  timer = setInterval(() => { input.data.moveX = 1; input.data.moveY = 0; input.send(); }, 1000 / INPUT_HZ);
  await waitFor(() => Math.abs(a.state.players.get(a.sessionId)!.x - expected.x) < .001 && !a.state.players.get(a.sessionId)!.moving,
    'server stops at the same owner blocker as prediction and Editor').catch((error: unknown) => {
      const player = a.state.players.get(a.sessionId);
      console.error({ expected, actual: { x: player?.x, y: player?.y, moving: player?.moving }, inputsSent: input.sentCount }); throw error;
    });
  clearInterval(timer); timer = undefined; input.data.moveX = 0; input.send();
  await waitFor(() => a.state.players.get(a.sessionId)!.ack >= input.sentCount && !a.state.players.get(a.sessionId)!.moving, 'stop consumed');
  await waitFor(() => rooms.every(r => Math.abs(r.state.players.get(a.sessionId)!.x - expected.x) < .001), 'all clients agree at blocker');
  a.send('input', { x: 2500, y: 100, speed: 9999 });
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.ok(Math.abs(a.state.players.get(a.sessionId)!.x - expected.x) < .001, 'wire float precision preserves wall position');
  const id = a.sessionId, token = a.reconnectionToken;
  a.reconnection.enabled = false; a.connection.close(4999);
  await waitFor(() => b.state.players.get(id)?.connected === false, 'drop stops movement');
  const recovered = await client.reconnect<CourtyardState>(token); rooms.push(recovered);
  await waitFor(() => recovered.state.players.get(id)?.connected && c.state.players.get(id)?.connected, 'same character reconnects');
  assert.equal(recovered.sessionId, id);
  assert.ok(Math.abs(recovered.state.players.get(id)!.x - expected.x) < .001);
  assert.ok(hangNhacWalkable(recovered.state.players.get(id)!));
  await recovered.leave(true); await waitFor(() => b.state.players.size === 2, 'leave removes player');
  const report = { passed: true, version: HANG_NHAC.version, checks: ['stale_map_rejected', 'three_appearances_same_room', 'owner_spawn',
    'server_editor_prediction_same_wall', 'all_clients_converge', 'raw_teleport_rejected', 'drop_stops_motion', 'same_session_reconnect_at_wall', 'leave_removes_entity'],
    blockerStop: expected, persistentProfiles: false };
  await mkdir('artifacts', { recursive: true }); await writeFile('artifacts/hang-nhac-online-verification.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  clearInterval(timer);
  for (const room of rooms) { room.reconnection.enabled = false; if (room.connection.transport.isOpen) await room.leave(true).catch(() => undefined); }
  service.stop();
}
