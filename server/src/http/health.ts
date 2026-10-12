import { HANG_NHAC, HANG_NHAC_ROOM } from '@shared/hang-nhac';
import { ROOM_NAME, TICK_MS } from '@shared/protocol/constants';
import { gameHttpConfig } from '../config';

export function health(_req: unknown, res: { json(body: unknown): void }): void {
  res.json({ ok: true, room: gameHttpConfig.allowGuest?ROOM_NAME:HANG_NHAC_ROOM, rooms: [...(gameHttpConfig.allowGuest?[ROOM_NAME]:[]), HANG_NHAC_ROOM], map: { id: HANG_NHAC.id, version: HANG_NHAC.version }, tickMs: TICK_MS,
    persistence: { hang_nhac: 'sqlite_accounts_realms_characters', legacyGuestPreview: gameHttpConfig.allowGuest } });
}
