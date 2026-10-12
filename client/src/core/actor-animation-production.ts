import type {PilotClip,PilotCatalog,PilotActorId} from './actor-animation-pilot';
export {pilotSample as productionSample,pilotDuration as productionDuration,pilotFrameAge as productionFrameAge} from './actor-animation-pilot';
export type ProductionActorId=PilotActorId;
export const PRODUCTION_DIRECTIONS=['south','southwest','west','northwest','north','northeast','east','southeast'] as const;
export type ProductionDirection=typeof PRODUCTION_DIRECTIONS[number];
export type ProductionClip=Omit<PilotClip,'direction'|'origin'>&{direction:ProductionDirection;origin:'new-imagegen'|'reused-canonical'|'reused-pilot-basis';sockets?:Array<[number,number]>};
export type ProductionCatalog=Omit<PilotCatalog,'directions'|'clips'>&{directions:ProductionDirection[];clips:Record<string,ProductionClip>;baselines?:Array<{id:string;name:string;url:string;frameSize:[number,number]}>;coverage:{required:string[];missing:string[];complete:boolean}};
export const DIRECTION_NAMES:Record<ProductionDirection,string>={south:'Nam',southwest:'Tây Nam',west:'Tây',northwest:'Tây Bắc',north:'Bắc',northeast:'Đông Bắc',east:'Đông',southeast:'Đông Nam'};
export const directionVector=(d:ProductionDirection):[number,number]=>({south:[0,1],southwest:[-Math.SQRT1_2,Math.SQRT1_2],west:[-1,0],northwest:[-Math.SQRT1_2,-Math.SQRT1_2],north:[0,-1],northeast:[Math.SQRT1_2,-Math.SQRT1_2],east:[1,0],southeast:[Math.SQRT1_2,Math.SQRT1_2]}[d] as [number,number]);
export function productionDirection(dx:number,dy:number,fallback:ProductionDirection='south'){if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<.001)return fallback;return (['east','southeast','south','southwest','west','northwest','north','northeast'] as const)[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];}
export function productionClip(catalog:ProductionCatalog,actor:ProductionActorId,action:string,direction:ProductionDirection){const clip=catalog.clips[actor+'-'+action+'-'+direction];if(!clip)throw new Error('Unavailable production binding '+actor+'/'+action+'/'+direction);return clip;}
