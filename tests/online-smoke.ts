import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { Client, type Room } from '@colyseus/sdk';
import type { CourtyardState } from '../server/src/state';
import { WORLD, isWalkable } from '../shared/world';
import { MoveInput, INPUT_HZ } from '../shared/netcode';
// @ts-expect-error Small process helper is intentionally shared with the browser's .mjs script.
import { startService, waitFor } from './support/services.mjs';

const endpoint = 'http://127.0.0.1:2577';
const service = await startService(['--import', 'tsx', 'server/src/index.ts'], `${endpoint}/health`, { PORT: '2577' });
const rooms: Room<CourtyardState>[] = [];
let inputTimer: ReturnType<typeof setInterval> | undefined;
try {
  const client = new Client(endpoint);
  const a = await client.joinOrCreate<CourtyardState>('sect_courtyard', { name: 'Kiểm thử A', avatarId: 'AVATAR-NOVICE-MALE' }); rooms.push(a);
  const b = await client.joinOrCreate<CourtyardState>('sect_courtyard', { name: 'Kiểm thử B', avatarId: 'AVATAR-NOVICE-FEMALE' }); rooms.push(b);
  await waitFor(() => a.state.players.size === 2 && b.state.players.size === 2, 'two clients see both players');
  console.log('OK: two clients joined the same room');
  assert.equal(a.roomId, b.roomId);
  assert.equal(a.state.players.get(b.sessionId)!.avatarId, 'AVATAR-NOVICE-FEMALE');
  const originalX = a.state.players.get(a.sessionId)!.x;
  a.send('input', { x: 99999, y: 0, seq: 0 });
  a.send('input', { x: 0, y: 0, seq: 1, speed: 99999 });
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.equal(a.state.players.get(a.sessionId)!.x, originalX);
  console.log('OK: invalid movement rejected');
  const input = a.input({ type: MoveInput });
  assert.equal(input.tickRate, INPUT_HZ);
  input.data.moveX = 99999; input.data.moveY = 0; input.send();
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(a.state.players.get(a.sessionId)!.x, originalX);
  const send = (x: number, y: number) => { input.data.moveX = x; input.data.moveY = y; input.send(); };
  inputTimer = setInterval(() => send(1, 0), 1000 / INPUT_HZ);
  await waitFor(() => a.state.players.get(a.sessionId)!.x > originalX + 40, 'movement arrives from server');
  clearInterval(inputTimer);
  send(0, 0);
  await waitFor(() => a.state.players.get(a.sessionId)!.ack >= input.sentCount && !a.state.players.get(a.sessionId)!.moving, 'stop command is actually consumed');
  await waitFor(() => Math.abs(a.state.players.get(a.sessionId)!.x - b.state.players.get(a.sessionId)!.x) < .001, 'both clients converge to server position');
  const stoppedX = a.state.players.get(a.sessionId)!.x;
  // An unsupported raw message cannot bypass the native input channel.
  a.send('input', { x: -1, y: 0, seq: 2 });
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.equal(a.state.players.get(a.sessionId)!.x, stoppedX);
  console.log('OK: native input, synchronized stop and unsupported raw message');
  const beforeFlood = a.state.players.get(a.sessionId)!.x;
  for (let i = 0; i < 12; i++) send(1, 0);
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.ok(a.state.players.get(a.sessionId)!.x - beforeFlood < 20, 'packet count cannot accelerate simulation');
  await waitFor(() => a.state.players.get(a.sessionId)!.ack >= input.sentCount, 'server consumes the actual input backlog');
  send(0, 0);
  inputTimer = setInterval(() => send(0, 1), 1000 / INPUT_HZ);
  await new Promise(resolve => setTimeout(resolve, 1300)); clearInterval(inputTimer);
  await waitFor(() => !a.state.players.get(a.sessionId)!.moving, 'stale input expires');
  const afterBoundary = a.state.players.get(a.sessionId)!;
  assert.ok(afterBoundary.y <= WORLD.bounds.y + WORLD.bounds.h - WORLD.radius); assert.ok(isWalkable(afterBoundary));
  console.log('OK: boundary and input timeout');
  const id = a.sessionId, token = a.reconnectionToken;
  a.reconnection.enabled = false;
  a.connection.close(4999);
  await waitFor(() => b.state.players.get(id)?.connected === false, 'drop is visible and movement is stopped');
  const recovered = await client.reconnect<CourtyardState>(token); rooms.push(recovered);
  await waitFor(() => recovered.state.players.get(id)?.connected === true && b.state.players.get(id)?.connected === true, 'same player reconnects');
  assert.equal(recovered.sessionId, id);
  assert.equal(recovered.state.players.get(id)!.x, afterBoundary.x);
  console.log('OK: dropped session reconnects to the same player');
  await recovered.leave(true);
  await waitFor(() => b.state.players.size === 1, 'leaving removes the player');
  const result = { passed: true, checks: ['two_clients_same_room', 'both_avatar_templates', 'reject_teleport_and_speed', 'native_input_axis_sanitization', 'authoritative_movement', 'processed_input_ack', 'packet_flood_does_not_increase_speed', 'shared_positions', 'solid_boundary', 'empty_input_stops_movement', 'drop_and_same_session_reconnect', 'leave_removes_entity'], persistentAccounts: false };
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/online-verification.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  clearInterval(inputTimer);
  for (const room of rooms) {
    room.reconnection.enabled = false;
    if (room.connection.transport.isOpen) await room.leave(true).catch(() => undefined);
  }
  service.stop();
}
