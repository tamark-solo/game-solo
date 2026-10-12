import type {AccountRole} from '../../../shared/game/entry';
import type {ContentCatalogReader} from '../core/content-ports';
import {GameError} from '../core/errors';
export class ContentCatalogService {
  constructor(private reader:ContentCatalogReader){}
  read(role:AccountRole){
    if(role!=='admin')throw new GameError('admin_required',403,'Tài khoản không có quyền quản trị catalog.');
    return this.reader.read();
  }
}
