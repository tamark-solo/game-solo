// Owner approved all three static concepts on 2026-10-12; production animation and unlocks remain separate.
export const CHARACTER_QI_CONCEPTS={
 lifeDeath:{name:'Luân Sinh Tử',variant:'sinhTu',image:'/assets/hoa-than-aura-concepts-v4/sinh-tu-wheel.png',description:'Luân ấn kim–ngà đối với mực chàm; viền tối nâng lõi sáng, tách khỏi nền đá.',colors:['#FAF0CA','#D9A84F','#182333'],intent:'Tu Đạo · concept đã chốt'},
 swordDomain:{name:'Kiếm Vực Huyền Ngọc',variant:'sinhTu',image:'/assets/hoa-than-aura-concepts-v4/jade-sword-domain.png',description:'Ba kiếm ảnh lam trắng, viền xanh đậm và điểm vàng; hình lực rõ ở cỡ nhỏ.',colors:['#BAF8FF','#147FBD','#12263D'],intent:'Đấu pháp · concept đã chốt'},
 bloodMoon:{name:'Huyết Nguyệt Ma Vực',variant:'huyenTu',image:'/assets/hoa-than-aura-concepts-v4/blood-moon-domain.png',description:'Huyết nguyệt lệch vai, mực đen và lõi đỏ trắng; khí sắc, ít sương tím.',colors:['#FFDBCB','#E33C31','#1D1425'],intent:'Đọa Ma · concept đã chốt'}
} as const;
export type CharacterQiConcept=keyof typeof CHARACTER_QI_CONCEPTS;
export const CHARACTER_QI_CONCEPT_FRAME={size:[128,176],pivot:[64,152],offsetFromBody:[-32,-64]} as const;
