import { Room, type Client } from 'colyseus';
import { CourtyardState, Disciple } from '@shared/protocol/courtyard-state';
import { MoveInput, sanitizeMovement } from '@shared/protocol/input';
import { AVATAR_IDS, INPUT_HZ, PATCH_MS } from '@shared/protocol/constants';
import { WORLD } from '@shared/world/map';
import { applyMovement, type MovementState } from '@shared/world/movement';
import { courtyardLimits } from '../../config';

export class CourtyardRoom extends Room<{ state: CourtyardState; input: MoveInput }> {
  state = new CourtyardState();
  maxClients = courtyardLimits.maxClients;
  maxMessagesPerSecond = courtyardLimits.maxMessagesPerSecond;
  inputs = this.defineInput(MoveInput, { bufferMaxSize: courtyardLimits.inputBufferSize, sanitize: sanitizeMovement });
  protected get avatars(): readonly string[] { return AVATAR_IDS; }
  protected spawn(slot: number): { x: number; y: number } {
    slot %= 10;
    return { x: WORLD.spawn.x + (slot % 5 - 2) * 34, y: WORLD.spawn.y + Math.floor(slot / 5) * 30 };
  }
  protected stepMovement(player: MovementState, input: MoveInput, dt: number): void { applyMovement(player, input, dt); }
  protected get simulateWithoutInput(): boolean { return false; }
  protected stepWithoutInput(player: MovementState, dt: number): void { this.stepMovement(player, new MoveInput({ moveX:0,moveY:0 }), dt); }
  protected beforeSimulation(_dt: number): void {}
  protected afterSimulation(_dt: number): void {}

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
    const avatarId = typeof data.avatarId === 'string' && this.avatars.includes(data.avatarId) ? data.avatarId : this.avatars[0];
    const slot = this.state.players.size % this.maxClients;
    const spawn = this.spawn(slot);
    this.state.players.set(client.sessionId, new Disciple({
      name, avatarId, x: spawn.x, y: spawn.y,
      direction: 'south', moving: false, connected: true, ack: -1,
      id: client.sessionId, profileId: '', progressionKind: '', hp: 100, mp: 100, casts: 0, practiceHits: 0, savedAt: 0,
      nextSwordAt: 0, nextThunderAt: 0, nextWindAt: 0, lastSpentAt: 0, castId: '', castSkill: '', castStartedAt: 0, castAimX:0, castAimY:0,
      motionLocked: false, dashVX: 0, dashVY: 0,
    }));
  }

  async onDrop(client: Client): Promise<void> {
    this.stop(client.sessionId);
    const player = this.state.players.get(client.sessionId);
    if (player) player.connected = false;
    try { await this.allowReconnection(client, courtyardLimits.reconnectSeconds); }
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

  protected stop(id: string): void {
    this.inputs.get(id).clear();
    const player = this.state.players.get(id);
    if (player) player.moving = false;
  }

  private simulate(dt: number): void {
    this.state.tick++;
    this.beforeSimulation(dt);
    for (const [id, player] of this.state.players) {
      const channel = this.inputs.get(id);
      const input = player.connected ? channel.next() : undefined;
      // One command per server tick: a client cannot increase speed by flooding inputs.
      if (input) this.stepMovement(player, input, dt);
      else if (player.connected && this.simulateWithoutInput) this.stepWithoutInput(player, dt);
      else player.moving = false;
      player.ack = channel.consumedCount;
    }
    this.afterSimulation(dt);
  }
}
