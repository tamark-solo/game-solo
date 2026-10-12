import type { IconKind } from './fixtures';

// V1 study icons retained below. V2 uses the generated, versioned item art;
// its source/prompt/crops live in character-van-ngoc-v2, pending visual review.
const DRAWINGS: Record<IconKind, string> = {
  sword: '<path d="m42 9 7 3-13 26-9 6-4-4 4-9Z" fill="url(#blade)"/><path d="m18 36 15 10-2 4-15-10Z" fill="#c7a66a"/><path d="m23 43-9 12-5-3 10-12" fill="#597a65"/><path d="m43 14-12 22" stroke="#ecf7d9" stroke-width="1.5"/>',
  robe: '<path d="m23 12 9 5 9-5 13 15-8 9-6-8 3 26H21l3-26-6 8-8-9Z" fill="url(#jade)"/><path d="m23 12 9 10 9-10M32 22v31M21 39h22" stroke="#d2ba82" stroke-width="2"/><path d="M26 29q7-5 10 0m-9 18q5-4 10 0" stroke="#d8e5c399" fill="none"/>',
  jade: '<path d="M32 7v8m0 31v12" stroke="#ae9965" stroke-width="2"/><path d="M20 16q12-7 24 0v22q-12 18-24 0Z" fill="url(#jade)" stroke="#cbb983" stroke-width="1.5"/><path d="M26 24q14-8 10 9t-8 1q-7-3 0-8" fill="none" stroke="#e4edce"/><path d="m28 54 4 5 4-5" fill="#b59757"/>',
  pill: '<path d="M23 12h18v6H23Z" fill="#b49258"/><path d="M25 18v8q-14 7-12 19 2 12 19 12t19-12q2-12-12-19v-8" fill="url(#jade)" stroke="#c7b67c"/><path d="M23 39q9-8 18 0-8 2-9 10-1-8-9-10" fill="#e1d3a2"/><path d="M20 32q-5 7-2 13" stroke="#e0f4d7" fill="none"/>',
  herb: '<path d="M31 55q4-23 1-42" fill="none" stroke="#b4cb86" stroke-width="3"/><path d="M31 30Q6 27 11 12q25 3 20 18m3 9q26-3 20-19-23 4-20 19M30 47Q8 47 9 31q19 0 21 16" fill="url(#jade)" stroke="#a7c482"/><path d="m32 20 1-13" stroke="#e4d59b" stroke-width="2"/>',
  ore: '<path d="m9 40 12-25 23-4 11 22-11 21-26 2Z" fill="#405956" stroke="#b6a472"/><path d="m21 15 8 23 15-27m-15 27 15 16M9 40l20-2 26-5" fill="none" stroke="#83a6a2"/><path d="m28 18 4 8m7 17 5-6" stroke="#dcc586" stroke-width="2"/>',
  book: '<path d="m17 10 34 4-5 41-35-3Z" fill="#203f3b" stroke="#bfac77" stroke-width="2"/><path d="m12 52 35 3 3-5-37-2" fill="#d8c695"/><path d="m22 12-5 38" stroke="#cbb782"/><path d="m26 20 15 2m-16 5 15 2m-16 5 15 2m-16 5 11 1" stroke="#b8cdb1"/><path d="m28 42 9 1" stroke="#e1bd76"/>',
  seal: '<path d="M32 7v8m0 35v9" stroke="#c3ac74" stroke-width="2"/><path d="m19 15 24 2 5 31-28 3-5-25Z" fill="#ad905b" stroke="#e6cea0"/><path d="m25 22 11 1-1 18-11-1Z" fill="none" stroke="#4a5944" stroke-width="2"/><path d="m22 32 17 1M31 22l-1 18" stroke="#4a5944" stroke-width="2"/>',
  pearl: '<circle cx="32" cy="31" r="20" fill="url(#jade)" stroke="#cbb782" stroke-width="1.5"/><path d="M19 35q9-23 23-13-3 15-17 13 17 14 20-4" fill="none" stroke="#e0eac2"/><path d="m11 49 5 7h32l5-7" fill="#b69b63"/><circle cx="25" cy="21" r="4" fill="#e4f6d5" opacity=".5"/>',
};
const PAINTED=['wood-sword','jade-sword','plain-robe','cloud-robe','jade-charm','lotus-pill','spirit-pill','herb','ore','manual','sect-seal','cloud-pearl'];
const REPRESENTATIVE:Record<IconKind,string>={sword:'jade-sword',robe:'cloud-robe',jade:'jade-charm',pill:'lotus-pill',herb:'herb',ore:'ore',book:'manual',seal:'sect-seal',pearl:'cloud-pearl'};
export function itemIcon(icon: IconKind, itemId?:string): string {
  const id=PAINTED.includes(itemId??'')?itemId!:REPRESENTATIVE[icon];
  return `<img class="painted-item-icon" src="/assets/character-ui-v2/${id}.webp" width="128" height="128" alt="" decoding="async">`;
}
// Original v1 code-native study retained for source/history, not the v2 visuals.
export function studyItemIcon(icon: IconKind): string {
  // Each SVG's gradients use unique IDs, avoiding cross-icon paint-server state.
  const id = `item-icon-${++sequence}`;
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}-jade" x2=".7" y2="1"><stop stop-color="#accdb7"/><stop offset=".45" stop-color="#4f8776"/><stop offset="1" stop-color="#183e3a"/></linearGradient><linearGradient id="${id}-blade" x2="1" y2="1"><stop stop-color="#f0edc5"/><stop offset="1" stop-color="#68a494"/></linearGradient></defs>${DRAWINGS[icon].replaceAll('url(#jade)', `url(#${id}-jade)`).replaceAll('url(#blade)', `url(#${id}-blade)`)}</svg>`;
}
let sequence = 0;
