import type {CatalogSnapshot} from '../../../shared/content/catalog';
export interface ContentCatalogReader {read():Promise<CatalogSnapshot>}
