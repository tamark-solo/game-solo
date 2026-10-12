import {randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import type {PasswordHasher} from '../core/ports';
import {GameError} from '../core/errors';

// OWASP scrypt alternative: N=2^15/r=8/p=3. Async work, two jobs maximum.
export class ScryptPasswords implements PasswordHasher {
  private active=0;
  private dummySalt=randomBytes(16);
  private dummyKey=randomBytes(32);
  private async derive(password:string,salt:Buffer):Promise<Buffer>{
    if(this.active>=2)throw new GameError('auth_busy',503,'Đăng nhập đang bận. Vui lòng thử lại sau ít giây.');
    this.active++;
    try{return await new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,32,{N:32768,r:8,p:3,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));}
    finally{this.active--;}
  }
  async hash(password:string){const salt=randomBytes(16),key=await this.derive(password,salt);return `scrypt$32768$8$3$${salt.toString('base64url')}$${key.toString('base64url')}`;}
  async verify(password:string,encoded:string|undefined){
    const parts=encoded?.split('$'),valid=!!parts&&parts.length===6&&parts.slice(0,4).join('$')==='scrypt$32768$8$3'&&/^[A-Za-z0-9_-]{22}$/.test(parts[4])&&/^[A-Za-z0-9_-]{43}$/.test(parts[5]);
    const salt=valid?Buffer.from(parts![4],'base64url'):this.dummySalt,target=valid?Buffer.from(parts![5],'base64url'):this.dummyKey;
    const key=await this.derive(password,salt);return timingSafeEqual(key,target)&&valid;
  }
}
