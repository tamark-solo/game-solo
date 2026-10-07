import { Room, type Client } from 'colyseus';
import { CourtyardState, Disciple } from './state';
import { WORLD } from '../../shared/world';
import { MoveInput, INPUT_HZ, PATCH_MS, applyMovement, sanitizeMovement } from '../../shared/netcode';

export const ROOM_NAME = 'sect_courtyard';
export const TICK_MS = 1000 / INPUT_HZ;
export const RECONNECT_SECONDS = 15;
const AVATARS = ['AVATAR-NOVICE-MALE', 'AVATAR-NOVICE-FEMALE'];
export class CourtyardRoom extends Room<{ state: CourtyardState; input: MoveInput }> {
  state = new CourtyardState();
  maxClients = 20; // A test-room limit, not a measured MMO capacity.
  maxMessagesPerSecond = 90;
  inputs = this.defineInput(MoveInput, { bufferMaxSize: 64, sanitize: sanitizeMovement });

  onCreate(): void {
    this.patchRate = PATCH_MS;
    // Raw position/speed JSON is not part of the input protocol.
    this.onMessage('input', () => undefined);
    this.setFixedTimestep(ctx => this.simulate(ctx.dt), INPUT_HZ);
  }

  onJoin(client: Client, options: unknown): void {
    const data = options && typeof options === 'object' ? options as Record<string, unknown> : {};
    const name = (typeof data.name === 'string' ? data.name : 'Đệ tử')
      .normalize('NFC').replace(/[\u0000-\u001f\u007f<>&]/g, '').trim().slice(0, 24) || 'Đệ tử';
    const avatarId = typeof data.avatarId === 'string' && AVATARS.includes(data.avatarId) ? data.avatarId : AVATARS[0];
    const slot = this.state.players.size % 10;
    this.state.players.set(client.sessionId, new Disciple({
      name, avatarId, x: WORLD.spawn.x + (slot % 5 - 2) * 34,
      y: WORLD.spawn.y + Math.floor(slot / 5) * 30,
      direction: 'south', moving: false, connected: true, ack: -1,
    }));
  }

  async onDrop(client: Client): Promise<void> {
    this.stop(client.sessionId);
    const player = this.state.players.get(client.sessionId);
    if (player) player.connected = false;
    try { await this.allowReconnection(client, RECONNECT_SECONDS); }
    catch { /* Colyseus invokes onLeave when the reserved reconnection expires. */ }
  }

  onReconnect(client: Client): void {
    const player = this.state.players.get(client.sessionId);
    if (player) player.connected = true;
    this.stop(client.sessionId);
  }

  onLeave(client: Client): void {
    this.state.players.delete(client.sessionId);
  }

  private stop(id: string): void {
    this.inputs.get(id).clear();
    const player = this.state.players.get(id);
    if (player) player.moving = false;
  }

  private simulate(dt: number): void {
    this.state.tick++;
    for (const [id, player] of this.state.players) {
      const channel = this.inputs.get(id);
      const input = player.connected ? channel.next() : undefined;
      // One command per server tick: a client cannot increase speed by flooding inputs.
      if (input) applyMovement(player, input, dt);
      else player.moving = false;
      player.ack = channel.consumedCount;
    }
  }
}
