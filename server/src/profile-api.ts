import type { ProfileStore } from './profile-store';
import type { ServerOptions } from 'colyseus';
import type { IncomingHttpHeaders } from 'node:http';

type ApiApplication = Parameters<NonNullable<ServerOptions['express']>>[0];
interface ApiRequest { headers: IncomingHttpHeaders; method: string }
interface ApiResponse { status(code:number):ApiResponse; json(value:unknown):void; end():void; setHeader(name:string,value:string):void }

// Local prototype only. The account token identifies a guest save, never a client-authored profile.
export function installProfileApi(app: ApiApplication, store: ProfileStore): void {
  app.use('/api', (req: ApiRequest, res: ApiResponse, next: () => void) => {
    const origin = req.headers.origin;
    if (origin && (typeof origin!=='string' || !/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(origin))) { res.status(403).json({ error: 'Origin không được phép.' }); return; }
    if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS'); res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'OPTIONS') { res.status(204).end(); return; }
    next();
  });
  const account = (req: ApiRequest) => {
    const header=req.headers.authorization;
    return store.authenticate(typeof header==='string'&&header.startsWith('Bearer ')?header.slice(7):undefined);
  };
  app.post('/api/profile-session', (req: ApiRequest, res: ApiResponse) => {
    if (req.headers.authorization) {
      const id = account(req); if (!id) { res.status(401).json({ error: 'Không tìm thấy hồ sơ thử trên server này.' }); return; }
      res.json({ profiles: store.list(id) }); return;
    }
    const created = store.createGuest(); res.status(201).json({ token: created.token, profiles: store.list(created.accountId) });
  });
  app.get('/api/profiles', (req: ApiRequest, res: ApiResponse) => {
    const id = account(req); if (!id) { res.status(401).json({ error: 'Hồ sơ thử không hợp lệ.' }); return; }
    res.json({ profiles: store.list(id) });
  });
}
