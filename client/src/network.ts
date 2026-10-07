import { Client, Predict, type Room, type InputHandle, type Reconciler } from '@colyseus/sdk';
import type { Data } from '@colyseus/schema';
import type { CourtyardState, Disciple } from '../../server/src/state';
import { DIRECTIONS, type Direction, type Input, type Motion } from '../../shared/world';
import { MoveInput, applyMovement } from '../../shared/netcode';

export interface OnlinePlayer extends Motion {
  id: string; name: string; avatarId: string; connected: boolean; ack: number;
}
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';
export class NetworkSession {
  room?: Room<CourtyardState>;
  players = new Map<string, OnlinePlayer>();
  status: ConnectionStatus = 'idle';
  detail = 'Chưa vào sân chung';
  latency = 0;
  private operation = 0;
  private prediction?: Predict;
  private inputHandle?: InputHandle<MoveInput>;
  private self?: Reconciler<Disciple, Data<MoveInput>>;
  private pingTimer?: ReturnType<typeof setInterval>;
  constructor(private readonly input: () => Input, private readonly changed: () => void) {}

  async connect(endpoint: string, name: string, avatarId: string): Promise<void> {
    if (this.status === 'connecting' || this.room) return;
    const operation = ++this.operation;
    this.status = 'connecting'; this.detail = 'Đang vào sân chung…'; this.changed();
    try {
      const client = new Client(endpoint);
      const room = await client.joinOrCreate<CourtyardState>('sect_courtyard', { name, avatarId });
      if (operation !== this.operation) { room.reconnection.enabled = false; await room.leave(true); return; }
      this.room = room;
      room.reconnection.minUptime = 0;
      room.reconnection.minDelay = 300;
      room.reconnection.maxDelay = 1000;
      room.reconnection.maxRetries = 12;
      room.onStateChange(() => this.readState());
      room.onDrop(() => {
        if (this.room !== room) return;
        this.status = 'reconnecting'; this.detail = 'Mất kết nối · đang thử lại'; this.changed();
      });
      room.onReconnect(() => {
        if (this.room !== room) { room.reconnection.enabled = false; void room.leave(true).catch(() => undefined); return; }
        this.status = 'connected'; this.detail = 'Đã kết nối lại cùng đệ tử'; this.changed();
      });
      room.onError((_code, message) => {
        if (this.room !== room) return;
        this.detail = message ?? 'Kết nối gặp lỗi'; this.changed();
      });
      room.onLeave(() => {
        if (this.room !== room) return;
        this.clear(); this.status = 'error'; this.detail = 'Phiên đã kết thúc. Bạn có thể vào lại sân.'; this.changed();
      });
      this.status = 'connected'; this.detail = 'Đang ở sân chung';
      this.pingTimer = setInterval(() => {
        if (this.status === 'connected') room.ping(ms => { this.latency = ms; this.changed(); });
      }, 2000);
      this.readState(); this.changed();
    } catch (error) {
      if (operation !== this.operation) return;
      this.clear(); this.status = 'error';
      this.detail = `Không kết nối được. Kiểm tra backend đang chạy. ${error instanceof Error ? error.message : ''}`;
      this.changed();
    }
  }

  async leave(): Promise<void> {
    this.operation++;
    const room = this.room;
    this.clear(); this.status = 'idle'; this.detail = 'Đã rời sân chung'; this.changed();
    if (room) { room.reconnection.enabled = false; await room.leave(true).catch(() => undefined); }
  }

  private clear(): void {
    clearInterval(this.pingTimer);
    this.prediction?.dispose();
    this.prediction = undefined; this.inputHandle = undefined; this.self = undefined;
    this.room = undefined; this.players.clear(); this.latency = 0;
  }

  private readState(): void {
    if (!this.room) return;
    this.players.clear();
    this.room.state.players?.forEach((p, id) => {
      this.players.set(id, { id, name: p.name, avatarId: p.avatarId, x: p.x, y: p.y,
        direction: DIRECTIONS.includes(p.direction as Direction) ? p.direction as Direction : 'south',
        moving: p.moving, connected: p.connected, ack: p.ack });
    });
    this.changed();
  }

  update(now: number): void {
    const room = this.room;
    if (!room) return;
    if (!this.prediction) {
      const own = room.state.players?.get(room.sessionId);
      if (!own) return;
      this.inputHandle = room.input({ type: MoveInput, mode: 'reliable' });
      if (!this.inputHandle.tickRate) throw new Error('Server chưa cung cấp nhịp mô phỏng cố định.');
      this.prediction = Predict.get(room, { mode: 'lerp', delay: 100, smoothMs: 0, snap: 128 });
      this.prediction.attachAll('players', { mode: 'lerp', fields: ['x', 'y'], delay: 100 });
      this.self = this.prediction.reconciler(own, {
        input: this.inputHandle, fields: ['x', 'y', 'direction', 'moving'], smoothMs: 35,
        step: (ctx, state, command) => applyMovement(state, command, ctx.dt),
      });
    }
    const steps = this.prediction.tick(now);
    if (this.status !== 'connected') return;
    const command = this.input();
    for (let i = 0; i < steps; i++) {
      this.inputHandle!.data.moveX = command.x;
      this.inputHandle!.data.moveY = command.y;
      this.inputHandle!.send();
    }
  }

  renderMotion(id: string): Motion | undefined {
    const entity = this.room?.state.players?.get(id);
    if (!entity || !this.prediction) return this.players.get(id);
    const own = id === this.room?.sessionId;
    return {
      x: this.prediction.value(entity, 'x'), y: this.prediction.value(entity, 'y'),
      direction: (own ? this.self?.state.direction ?? entity.direction : entity.direction) as Direction,
      moving: own ? this.self?.state.moving ?? false : entity.moving,
    };
  }
}
