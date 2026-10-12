import type {GameSessionView,AdminSnapshot} from '../../../shared/game/entry';
import type {CatalogSnapshot,CatalogFilters} from '../../../shared/content/catalog';
export interface GameAdminState {session?:GameSessionView;snapshot?:AdminSnapshot;status?:Record<string,unknown>;busy:boolean;message:string;requestId:string;offset:number;loading:boolean;tab:'operations'|'catalog';catalog?:CatalogSnapshot;catalogFilters:CatalogFilters;catalogSelection?:string}
export const createGameAdminState=():GameAdminState=>({busy:false,message:'',requestId:'',offset:0,loading:true,tab:'operations',catalogFilters:{query:'',domain:'',implementation:''}});
export const GAME_ADMIN_IDS={mount:'admin-panel',login:'admin-login',password:'admin-password',message:'admin-message',trace:'admin-trace',catalogQuery:'catalog-query',catalogDomain:'catalog-domain',catalogSubtype:'catalog-subtype',catalogImplementation:'catalog-implementation',catalogDetail:'catalog-detail'} as const;
