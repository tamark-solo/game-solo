import { Client, CloseCode, ErrorCode, Predict, type Room, type InputHandle, type Reconciler } from '@colyseus/sdk';
import type { Data } from '@colyseus/schema';
import type { CourtyardState, Disciple } from '../../server/src/state';
import { DIRECTIONS, type Direction, type Input, type Motion } from '../../shared/world';
import { MoveInput, applyMovement, type MovementState } from '../../shared/netcode';

export interface OnlinePlayer extends Motion {
  id: string; name: string; avatarId: string; connected: boolean; ack: number;
}
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';
export interface SessionOptions {
  roomName?: string;
  joinOptions?: Record<string, unknown> | (() => Record<string, unknown>);
  movementStep?: (state: MovementState, command: { moveX: number; moveY: number }, dt: number) => void;
  motionFields?: Array<'motionLocked' | 'dashVX' | 'dashVY'>;
  resumeToken?: () => string | undefined;
  recover?: boolean;
  connected?: (room: Room<CourtyardState>) => void;
}
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
  private recoveryTimer?: ReturnType<typeof setTimeout>;
  constructor(private readonly input: () => Input, private readonly changed: () => void, private readonly options: SessionOptions = {}) {}

  async connect(endpoint: string, name: string, avatarId: string): Promise<void> {
    if (this.status === 'connecting' || this.status === 'reconnecting' || this.room) return;
    const operation = ++this.operation;
    await this.open(endpoint, name, avatarId, operation);
  }

  private async open(endpoint: string, name: string, avatarId: string, operation: number, recoveryAttempt?: number): Promise<void> {
    this.status = recoveryAttempt === undefined ? 'connecting' : 'reconnecting';
    this.detail = recoveryAttempt === undefined ? 'Đang vào sân chung…' : 'Đang khôi phục sân chung từ bản lưu…'; this.changed();
    try {
      const client = new Client(endpoint);
      const joinOptions = typeof this.options.joinOptions === 'function' ? this.options.joinOptions() : this.options.joinOptions;
      const resume = this.options.resumeToken?.();
      let room: Room<CourtyardState>;
      try { if (!resume) throw new Error('Fresh session'); room = await client.reconnect<CourtyardState>(resume); }
      catch { room = await client.joinOrCreate<CourtyardState>(this.options.roomName ?? 'sect_courtyard', { ...joinOptions, name, avatarId }); }
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
        // The SDK raises onReconnect before replacing reconnectionToken. Persisting
        // it inside that callback stores the expired token and breaks the next reload.
        queueMicrotask(() => {
          if (this.room !== room) { room.reconnection.enabled = false; void room.leave(true).catch(() => undefined); return; }
          this.status = 'connected'; this.detail = 'Đã kết nối lại cùng đệ tử';
          this.options.connected?.(room); this.changed();
        });
      });
      room.onError((_code, message) => {
        if (this.room !== room) return;
        this.detail = message ?? 'Kết nối gặp lỗi'; this.changed();
      });
      room.onLeave(code => {
        if (this.room !== room) return;
        this.clear();
        if (this.options.recover && code !== CloseCode.CONSENTED) this.recover(endpoint, name, avatarId, operation, 0);
        else { this.status = 'error'; this.detail = 'Phiên đã kết thúc. Bạn có thể vào lại sân.'; this.changed(); }
      });
      this.status = 'connected'; this.detail = 'Đang ở sân chung';
      this.options.connected?.(room);
      this.pingTimer = setInterval(() => {
        if (this.status === 'connected') room.ping(ms => { this.latency = ms; this.changed(); });
      }, 2000);
      this.readState(); this.changed();
    } catch (error) {
      if (operation !== this.operation) return;
      this.clear();
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
      const denied = [401, 403, 409, ErrorCode.AUTH_FAILED].includes(code as number);
      if (recoveryAttempt !== undefined && recoveryAttempt < 5 && !denied) {
        this.recover(endpoint, name, avatarId, operation, recoveryAttempt + 1); return;
      }
      this.status = 'error';
      this.detail = `Không vào được sân. ${error instanceof Error ? error.message : 'Kiểm tra backend đang chạy.'}`;
      this.changed();
    }
  }

  private recover(endpoint: string, name: string, avatarId: string, operation: number, attempt: number): void {
    this.status = 'reconnecting'; this.detail = 'Đang khôi phục sân chung từ bản lưu…'; this.changed();
    this.recoveryTimer = setTimeout(() => {
      if (operation !== this.operation || this.room) return;
      void this.open(endpoint, name, avatarId, operation, attempt);
    }, Math.min(3000, 500 * 2 ** attempt));
  }

  async leave(): Promise<void> {
    this.operation++;
    const room = this.room;
    this.clear(); this.status = 'idle'; this.detail = 'Đã rời sân chung'; this.changed();
    if (room) { room.reconnection.enabled = false; await room.leave(true).catch(() => undefined); }
  }

  suspend(): void {
    this.operation++;
    const room = this.room;
    if (room) { room.reconnection.enabled = false; room.connection.close(4999); }
    this.clear();
  }

  private clear(): void {
    clearInterval(this.pingTimer);
    clearTimeout(this.recoveryTimer); this.recoveryTimer = undefined;
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
        input: this.inputHandle, fields: ['x', 'y', 'direction', 'moving', ...(this.options.motionFields ?? [])], smoothMs: 35,
        step: (ctx, state, command) => (this.options.movementStep ?? applyMovement)(state, command, ctx.dt),
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

  // Skills wait for the next ordinary movement tick; never send extra physics steps from a key event.
  nextInputSequence():number {return (this.inputHandle?.sentCount??0)+1;}

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
