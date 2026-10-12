// Appearance-only catalog. Runtime activation must later consume server facts.
export const CHARACTER_QI_THEMES={
 sinhTu:{ground:'/assets/wang-lin-hoa-than-review-v2/sinh-tu-qi.png',back:'/assets/wang-lin-hoa-than-review-v2/sinh-tu-back.png',front:'/assets/wang-lin-hoa-than-review-v2/sinh-tu-front.png',mote:'/assets/wang-lin-hoa-than-review-v2/sinh-tu-mote.png'},
 huyenTu:{ground:'/assets/wang-lin-hoa-than-review-v2/huyen-tu-qi.png',back:'/assets/wang-lin-hoa-than-review-v2/huyen-tu-back.png',front:'/assets/wang-lin-hoa-than-review-v2/huyen-tu-front.png',mote:'/assets/wang-lin-hoa-than-review-v2/huyen-tu-mote.png'}
} as const;
export type CharacterQiTheme=keyof typeof CHARACTER_QI_THEMES;
export const CHARACTER_QI_LAYER_CONTRACT={ground:{frame:[96,32],pivot:[48,16],offset:[-16,72]},back:{frame:[96,128],pivot:[48,112],offset:[-16,-24]},front:{frame:[96,64],pivot:[48,48],offset:[-16,40]}} as const;
