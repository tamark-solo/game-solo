import { HANG_NHAC, HANG_NHAC_ROOM } from '@shared/hang-nhac';
import { ROOM_NAME, TICK_MS } from '@shared/protocol/constants';

export function health(_req: unknown, res: { json(body: unknown): void }): void {
  res.json({ ok: true, room: ROOM_NAME, rooms: [ROOM_NAME, HANG_NHAC_ROOM], map: { id: HANG_NHAC.id, version: HANG_NHAC.version }, tickMs: TICK_MS,
    persistence: { sect_courtyard: 'memory_only', hang_nhac: 'sqlite_guest_profiles' } });
}
