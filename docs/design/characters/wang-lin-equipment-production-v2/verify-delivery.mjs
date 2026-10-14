import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=async p=>JSON.parse((await fs.readFile(path.resolve(root,p),'utf8')).replace(/^\uFEFF/,''));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const delivery=await read('review/delivery.json'),basis=await read(delivery.basis.file);
if(delivery.status!=='P4-P5-review-ready'||delivery.coverage.bodyClips!==512||delivery.coverage.completeFamilies.length!==4||delivery.runtimeIntegrated!==false)throw Error('Incomplete or out-of-scope delivery');
for(const p of [...delivery.files,...basis.files,...basis.protectedRuntimeAndMap])if(sha(await fs.readFile(path.resolve(root,p.file)))!==p.sha256)throw Error('Delivery pin changed: '+p.file);
const report={schema:'wang-lin-equipment-delivery-verification-2',date:'2026-10-14',status:'passed',deliverySha256:sha(await fs.readFile(path.join(root,'review/delivery.json'))),coverage:delivery.coverage,
 newPackagePins:delivery.files.length,basisPins:basis.files.length,runtimeAndMapPins:basis.protectedRuntimeAndMap.length,ownerApprovalInferred:false,runtimeImported:false};
if(process.argv.includes('--final'))await fs.writeFile(path.join(root,'review/delivery-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
