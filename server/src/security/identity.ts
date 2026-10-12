import {randomBytes,randomUUID,createHash} from 'node:crypto';
import type {IdentitySource} from '../core/ports';
export const cryptographicIdentity:IdentitySource={id:()=>randomUUID(),secret:()=>randomBytes(32).toString('base64url'),digest:value=>createHash('sha256').update(value).digest('hex')};
