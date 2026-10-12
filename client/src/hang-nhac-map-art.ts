import { HANG_NHAC } from '../../shared/hang-nhac';
import detailArt from './hang-nhac-van-ngoc-detail-art.json';
import type { PreviewRenderer } from './render/renderer';

export type HangNhacMapArtId = 'current' | 'van-ngoc' | 'van-ngoc-detail';

export function parseHangNhacMapArt(value: string | null): HangNhacMapArtId {
  return value === 'van-ngoc' || value === 'van-ngoc-detail' ? value : 'current';
}

// Display choices only. The server release and owner navigation stay authoritative.
export function hangNhacMapArt(id: HangNhacMapArtId) {
  const concept = id === 'van-ngoc';
  const detail = id === 'van-ngoc-detail';
  return {
    id,
    status: concept ? 'concept-preview' : detail ? detailArt.status : 'runtime',
    backgroundUrl: concept ? '/assets/dao-dual-theme-v1/concept.webp'
      : detail ? detailArt.backgroundUrl : HANG_NHAC.background.url,
    nativeWidth: concept ? 1536 : HANG_NHAC.world.width,
    nativeHeight: concept ? 1024 : HANG_NHAC.world.height,
    worldWidth: HANG_NHAC.world.width,
    worldHeight: HANG_NHAC.world.height,
    bytes: concept ? 860598 : detail ? detailArt.bytes : HANG_NHAC.background.bytes,
    ...(detail ? { sha256: detailArt.sha256, sectorCount: detailArt.sectorCount,
      ownerApproved: detailArt.ownerApproved, artApproved: detailArt.artApproved,
      approvalScope: detailArt.approvalScope, productionLayersApproved: detailArt.productionLayersApproved,
      exactFootprintVerified: detailArt.exactFootprintVerified } : {}),
    note: concept
      ? 'Đang xem concept Vân Ngọc cùng nhân vật ở 1×. Mái và tán chưa có lớp che riêng; vùng đi vẫn theo map hiện hành.'
      : detail ? `Nền chuẩn ART Vân Ngọc đã được chọn, từ ${detailArt.sectorCount} vùng, ảnh 3072 × 2048 ở 1×. Mái và tán chưa tách lớp; vùng đi vẫn theo map hiện hành.`
      : 'Nền hiện hành với mái và tán tách lớp. Chọn Vân Ngọc để đối chiếu phong cách và tỷ lệ.',
  };
}

export async function loadHangNhacMapArt(renderer: PreviewRenderer, id: HangNhacMapArtId): Promise<void> {
  if (id === 'current') return renderer.loadAuthoredMap(HANG_NHAC.scene);
  const art = hangNhacMapArt(id);
  await renderer.loadBackgroundMap(art.backgroundUrl, art.worldWidth, art.worldHeight,
    { width: art.nativeWidth, height: art.nativeHeight, sampling: id === 'van-ngoc-detail' ? 'nearest' : 'linear' });
}
