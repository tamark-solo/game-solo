import type { AppState } from '../../core/state';
import { dom } from '../../core/elements';

// Online panel: connection chip, room id, roster and the stage message while in online mode.
export function updateNetworkUI(app: AppState): void {
  const { network } = app;
  const busy = network.status === 'connecting' || network.status === 'reconnecting';
  dom.joinButton.disabled = busy || Boolean(network.room) || !app.renderer?.assets.has('AVATAR-NOVICE-MALE') || !app.renderer?.assets.has('AVATAR-NOVICE-FEMALE');
  dom.leaveButton.disabled = !network.room;
  dom.nameInput.disabled = dom.avatarSelect.disabled = dom.serverInput.disabled = busy || Boolean(network.room);
  dom.networkStatus.textContent = network.detail;
  dom.connectionChip.dataset.status = app.mode === 'online' ? network.status : 'idle';
  dom.connectionChip.replaceChildren(document.createElement('i'), document.createTextNode(app.mode === 'online' ? {
    idle: 'Hãy vào sân', connecting: 'Đang kết nối', connected: `${network.players.size} đệ tử online`, reconnecting: 'Đang kết nối lại', error: 'Chưa kết nối',
  }[network.status] : 'Cục bộ'));
  dom.roomId.textContent = network.room ? `Phòng ${network.room.roomId}` : 'Chưa có phiên';
  const list = dom.playerList;
  const signature = [...network.players.values()].map(p => `${p.id}:${p.name}:${p.connected}`).join('|');
  if (list.dataset.signature !== signature) {
    list.dataset.signature = signature; list.replaceChildren();
    for (const p of network.players.values()) {
      const card = document.createElement('div'); card.className = `player-card${p.id === network.room?.sessionId ? ' own' : ''}`; card.dataset.playerId = p.id;
      const title = document.createElement('strong'); title.textContent = `${p.name}${p.id === network.room?.sessionId ? ' · bạn' : ''}`;
      const description = document.createElement('span'); description.textContent = p.connected ? (p.avatarId.endsWith('FEMALE') ? 'Đệ tử nữ · trong sân' : 'Đệ tử nam · trong sân') : 'Đang mất kết nối';
      card.append(title, description); list.append(card);
    }
  }
  if (app.mode === 'online') {
    dom.stageMessage.hidden = Boolean(network.room);
    dom.stageMessage.classList.toggle('error', network.status === 'error');
    dom.stageMessage.textContent = network.status === 'idle' ? 'Chọn tên và tạo hình, rồi bấm “Vào sân”.' : network.detail;
  }
}
