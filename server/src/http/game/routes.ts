import express,{type Application,type Request,type Response,type NextFunction} from 'express';
import {performance} from 'node:perf_hooks';
import {randomUUID} from 'node:crypto';
import {GameError} from '../../core/errors';
import type {GameLogger} from '../../core/ports';
import type {EntryService,Authenticated} from '../../application/entry-service';
import type {ContentCatalogService} from '../../application/content-catalog-service';

export interface GameHttpOptions {service:EntryService;catalog:ContentCatalogService;logger:GameLogger;cookieName:string;secureCookie:boolean;allowsOrigin:(origin:string)=>boolean;operationalStatus:()=>unknown}
interface Context {requestId:string;auth?:Authenticated}
export function installGameApi(app:Application,options:GameHttpOptions){
  const router=express.Router(),contexts=new WeakMap<Request,Context>();
  const context=(req:Request)=>contexts.get(req)!;
  const cookie=(req:Request)=>{const part=req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith(options.cookieName+'='));return part?.slice(options.cookieName.length+1);};
  const auth=(req:Request)=>context(req).auth??(context(req).auth=options.service.authenticate(cookie(req)));
  const setCookie=(res:Response,secret:string,expiresAt:number)=>res.cookie(options.cookieName,secret,{httpOnly:true,secure:options.secureCookie,sameSite:'strict',path:'/',expires:new Date(expiresAt)});
  const route=(fn:(req:Request,res:Response)=>unknown)=>async(req:Request,res:Response,next:NextFunction)=>{try{await fn(req,res);}catch(error){next(error);}};
  router.use((req,res,next)=>{
    const candidate=req.headers['x-request-id'],requestId=typeof candidate==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(candidate)?candidate:randomUUID(),started=performance.now();
    contexts.set(req,{requestId});res.setHeader('X-Request-Id',requestId);res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    res.on('finish',()=>options.logger.event('http.request',{requestId,method:req.method,route:String(req.route?.path??'unmatched'),status:res.statusCode,durationMs:Math.round(performance.now()-started)}));
    const origin=req.headers.origin;
    if(origin&&!options.allowsOrigin(origin)){next(new GameError('origin',403,'Nguồn truy cập không được cho phép.'));return;}
    if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Vary','Origin');}
    res.setHeader('Access-Control-Allow-Headers','Content-Type,X-Game-CSRF,X-Game-Client,X-Request-Id');res.setHeader('Access-Control-Expose-Headers','X-Request-Id');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,OPTIONS');
    if(req.method==='OPTIONS'){res.status(204).end();return;}
    if(req.method!=='GET'&&(req.headers['x-game-client']!=='h5'||!req.is('application/json'))){next(new GameError('invalid',400,'Định dạng thao tác chưa hợp lệ.'));return;}
    next();
  });
  router.use(express.json({limit:'8kb',strict:true}));
  router.use((req,_res,next)=>{
    if(req.method==='GET'||['/register','/login'].includes(req.path)){next();return;}
    try{options.service.checkCsrf(auth(req),req.headers['x-game-csrf']);next();}catch(error){next(error);}
  });
  router.post('/register',route(async(req,res)=>{const value=await options.service.register(req.body,req.socket.remoteAddress??'unknown',context(req).requestId);setCookie(res,value.secret,value.view.expiresAt);res.status(201).json(value.view);}));
  router.post('/login',route(async(req,res)=>{const value=await options.service.login(req.body,req.socket.remoteAddress??'unknown',context(req).requestId);setCookie(res,value.secret,value.view.expiresAt);res.json(value.view);}));
  router.get('/session',route((req,res)=>res.json(options.service.session(cookie(req)))));
  router.post('/logout',route((req,res)=>{options.service.logout(auth(req),context(req).requestId);res.clearCookie(options.cookieName,{httpOnly:true,secure:options.secureCookie,sameSite:'strict',path:'/'});res.json({ok:true});}));
  router.get('/realms',route((req,res)=>res.json({realms:options.service.realms(auth(req))})));
  router.get('/characters',route((req,res)=>res.json({characters:options.service.characters(auth(req),req.query.realmId)})));
  router.post('/characters',route((req,res)=>res.status(201).json(options.service.createCharacter(auth(req),req.body,context(req).requestId))));
  router.post('/play-ticket',route((req,res)=>res.json(options.service.ticket(auth(req),req.body,context(req).requestId))));
  router.get('/admin',route((req,res)=>res.json(options.service.snapshot(auth(req),req.query.offset===undefined?0:Number(req.query.offset)))));
  router.get('/admin/status',route((req,res)=>{options.service.admin(auth(req));res.json(options.operationalStatus());}));
  router.get('/admin/catalog',route(async(req,res)=>res.json(await options.catalog.read(auth(req).account.role))));
  router.patch('/admin/accounts/:id',route((req,res)=>{options.service.changeAccount(auth(req),String(req.params.id),req.body,context(req).requestId);res.json({ok:true});}));
  router.post('/admin/realms',route((req,res)=>{const {id,...value}=req.body??{};res.status(201).json(options.service.changeRealm(auth(req),String(id),value,context(req).requestId,true));}));
  router.patch('/admin/realms/:id',route((req,res)=>res.json(options.service.changeRealm(auth(req),String(req.params.id),req.body,context(req).requestId))));
  router.use((_req,_res,next)=>next(new GameError('not_found',404,'Không tìm thấy chức năng.')));
  router.use((error:unknown,req:Request,res:Response,_next:NextFunction)=>{
    const known=error instanceof GameError,parseError=!!error&&typeof error==='object'&&'type' in error&&['entity.too.large','entity.parse.failed'].includes(String(error.type));
    const status=known?error.status:parseError?400:500,code=known?error.code:parseError?'invalid_json':'internal';
    if(status>=500)options.logger.failure('http.failed',{requestId:context(req).requestId,code,status},error);
    res.status(status).json({code,message:known?error.publicMessage:parseError?'Dữ liệu thao tác chưa hợp lệ.':'Chưa xử lý được thao tác. Vui lòng thử lại.',requestId:context(req).requestId});
  });
  app.use('/api/game',router);
}
