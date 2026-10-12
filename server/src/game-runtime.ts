import {resolve} from 'node:path';
import {GameConnection} from './persistence/game-connection';
import {sqliteGameRepositories} from './persistence/game-repositories';
import {ScryptPasswords} from './security/passwords';
import {cryptographicIdentity} from './security/identity';
import {EntryService} from './application/entry-service';
import {GameObserver} from './observability/game-observer';
import {serverConfig} from './config';
import {fileURLToPath} from 'node:url';
import {ContentCatalogService} from './application/content-catalog-service';
import {FileContentCatalog} from './persistence/content-catalog-file';

// Composition root: only here do application ports meet infrastructure adapters.
export async function createGameRuntime(){
  const allowLocalAdminShortPassword=process.env.GAME_LOCAL_ADMIN_SHORT_PASSWORD==='1';
  if(allowLocalAdminShortPassword&&(process.env.NODE_ENV==='production'||!['127.0.0.1','localhost','::1'].includes(serverConfig.host)))throw new Error('GAME_LOCAL_ADMIN_SHORT_PASSWORD is allowed only on a non-production loopback server.');
  const nodeId=process.env.GAME_NODE_ID??`${serverConfig.host}:${serverConfig.port}`;
  if(!/^[A-Za-z0-9_.:-]{1,80}$/.test(nodeId))throw new Error('GAME_NODE_ID is invalid.');
  const connection=new GameConnection(process.env.GAME_DB_PATH??resolve('server/data/profiles.sqlite'));
  const observer=new GameObserver(nodeId),repositories=sqliteGameRepositories(connection,observer);
  const service=new EntryService({repositories,passwords:new ScryptPasswords(),identity:cryptographicIdentity,logger:observer,nodeId,allowLocalAdminShortPassword});
  const catalog=new ContentCatalogService(new FileContentCatalog(fileURLToPath(new URL('../../',import.meta.url)),process.env.GAME_CONTENT_CATALOG_PATH));
  try{
    // A node ID identifies one running process. Reboot clears only that node's leases.
    repositories.transaction(()=>{
      repositories.leases.recoverNode(nodeId);
      if(!repositories.realms.get('hang-nhac-1'))repositories.realms.insert({id:'hang-nhac-1',name:'S1 · Hằng Nhạc',status:'online',characterSlots:3,creationEnabled:true,updatedAt:Date.now()});
    });
    const adminLogin=process.env.GAME_BOOTSTRAP_ADMIN_LOGIN,adminPassword=process.env.GAME_BOOTSTRAP_ADMIN_PASSWORD;
    if(!!adminLogin!==!!adminPassword)throw new Error('Both bootstrap admin environment fields are required.');
    if(adminLogin&&adminPassword)await service.bootstrapAdmin(adminLogin,adminPassword);
    const timer=setInterval(()=>{try{repositories.prune(Date.now());}catch(error){observer.failure('database.prune-failed',{},error);}},60_000);timer.unref();
    return {service,catalog,observer,repositories,ready:()=>repositories.probe(),status:()=>{repositories.probe();return {ok:true,storage:'sqlite-wal',schema:1,activePlayers:repositories.leases.count(Date.now()),...observer.snapshot()};},
      dispose:()=>{clearInterval(timer);observer.dispose();connection.close();}};
  }catch(error){observer.dispose();connection.close();throw error;}
}
