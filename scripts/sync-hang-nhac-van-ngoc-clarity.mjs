import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectImageDimensions, detectImageType } from './imagegen-router.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = resolve(root, 'docs/design/world/hang-nhac-van-ngoc-detail-v2/regions');
const target = resolve(root, 'client/public/assets/hang-nhac-van-ngoc-detail-v2');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const fail = message => { throw new Error(`Vân Ngọc clarity: ${message}`); };
const rects = Object.fromEntries([0,448,896,1344].flatMap((y,row)=>[0,592,1184,1776,2368].map((x,col)=>
  [`D${String(row*5+col+1).padStart(2,'0')}`,[x,y,x+704,y+704]])));

async function image(record, allowed, size) {
  const path = await realpath(resolve(base,record.path));
  const within = relative(await realpath(allowed),path);
  if (within === '..' || within.startsWith(`..${sep}`) || isAbsolute(within)) fail('Source escaped its allowed directory');
  const bytes = await readFile(path), actual = detectImageDimensions(bytes);
  if (sha(bytes)!==record.sha256 || bytes.length!==record.bytes || !actual ||
      !same([actual.width,actual.height],[record.width,record.height]) || size && !same(size,[actual.width,actual.height])) fail(`Image changed: ${record.path}`);
  return { path, bytes, mime: detectImageType(bytes).mimeType };
}

export function validateVanNgocBaselineApproval(approval, composition) {
  if (approval?.schema!=='game-solo-map-art-baseline-approval-1' ||
      approval.status!=='owner-approved-art-baseline' || approval.approvedBy!=='owner' ||
      approval.evidence?.source!=='owner-chat' || !approval.evidence.statement?.trim() ||
      approval.scope!=='baked-background-art-baseline' || approval.ownerApproved!==true || approval.artApproved!==true ||
      approval.master?.sha256!==composition.master.sha256 || approval.web?.sha256!==composition.web.sha256 ||
      !same(approval.worldSize,[3072,2048]) || !same(approval.characterFrame,[64,96]) ||
      !same(approval.characterAnchor,[32,88]) || approval.cameraScale!==1 || approval.selectedRegionCount!==20 ||
      approval.productionLayersApproved!==false || approval.exactFootprintVerified!==false ||
      approval.navigationModified!==false || approval.authoredMapsModified!==false)
    fail('Owner baseline approval does not cover this exact image and scope');
}

export async function verifyVanNgocClarity() {
  const [manifestBytes,registrationBytes,compositionBytes] = await Promise.all(
    ['production.json','registration.json','composition.json'].map(name=>readFile(resolve(base,name))));
  const manifest = JSON.parse(manifestBytes), registration = JSON.parse(registrationBytes), composition = JSON.parse(compositionBytes);
  const composedAt = Date.parse(composition.createdAt), registeredAt = Date.parse(registration.createdAt);
  if (composition.schemaVersion!==2 || composition.status!=='stitched-awaiting-visual-review' ||
      composition.freshCompositionWritten!==true || !same(composition.worldSize,[3072,2048]) ||
      registration.allTwentyPresent!==true || registration.allTwentyRegistrationPassed!==true ||
      registration.manifest.sha256!==sha(manifestBytes) || !same(composition.manifest,registration.manifest) ||
      !Number.isFinite(composedAt) || !Number.isFinite(registeredAt) || composedAt<registeredAt) fail('Missing fresh twenty-region composition');
  for (const field of ['ownerApproved','artApproved','navigationModified','authoredMapsModified']) {
    if (composition[field]!==false || registration[field]!==false || manifest[field]!==false) fail(`Preview contract changed: ${field}`);
  }
  for (const field of ['wholeMapUpscale','wholeMapSharpen','wholeMapBlur','exactFootprintVerified']) {
    if (composition[field]!==false) fail(`Processing contract changed: ${field}`);
  }
  if (!same(composition.source,registration.source) || composition.source.sha256!==manifest.source.sha256 ||
      manifest.selectedStyle.ownerSelected!==true || manifest.nativeRegionSize.join(',')!=='704,704') fail('Layout/style provenance changed');
  const style = await readFile(resolve(base,manifest.selectedStyle.path));
  if (sha(style)!==manifest.selectedStyle.sha256) fail('Owner-selected style sample changed');
  await image(composition.source,resolve(base,'inputs'),[3072,2048]);
  const ids = Object.keys(rects);
  for (const collection of [manifest.regions,registration.regions,composition.regions]) {
    if (!same(collection.map(r=>r.id).sort(),ids)) fail('Exactly D01 through D20 required');
  }
  for (const region of composition.regions) {
    const measured = registration.regions.find(r=>r.id===region.id);
    if (!same(region.rect,rects[region.id]) || measured.status!=='registration-passed-awaiting-visual-review' ||
        !same(region.raw,measured.raw) || !same(region.registered,measured.registered) || !same(region.fit,measured.fit) ||
        !same(region.generationMetadata,measured.generationMetadata) ||
        region.visualReview.status!=='accepted' || region.deliverySampling.passes!==1 || region.normalization.sectorUpsampled!==false) fail(`Unverified region ${region.id}`);
    const metadataBytes = await readFile(resolve(base,region.generationMetadata.path));
    if (sha(metadataBytes)!==region.generationMetadata.sha256 || metadataBytes.length!==region.generationMetadata.bytes) fail(`Generation metadata changed: ${region.id}`);
    await image(region.raw,resolve(base,'generated'));
    await image(region.registered,resolve(base,'registered'),[704,704]);
  }
  const master = await image(composition.master,base,[3072,2048]);
  const web = await image(composition.web,base,[3072,2048]);
  if (master.mime!=='image/png' || web.mime!=='image/webp' || composition.webEncoding!=='lossless') fail('Expected PNG master and lossless WebP');
  const reviewBytes = await readFile(resolve(base,'review/delivery/review.json'));
  const review = JSON.parse(reviewBytes);
  if (review.masterSha256!==composition.master.sha256 || review.webSha256!==composition.web.sha256 ||
      review.losslessDecodedRgbMatchesMaster!==true || review.visualReview.status!=='accepted-for-game-preview' ||
      review.ownerApproved!==false || review.artApproved!==false || review.actorResized!==false ||
      !same(review.actorFrame,[64,96]) || !same(review.actorAnchor,[32,88]) || review.seams.length!==19) fail('Missing native delivery review');
  const approvalBytes = await readFile(resolve(base,'../approval.json'));
  const approval = JSON.parse(approvalBytes);
  validateVanNgocBaselineApproval(approval,composition);
  return { web, artwork: { schema:'game-solo-map-detail-preview-2',status:'art-baseline',
    backgroundUrl:'/assets/hang-nhac-van-ngoc-detail-v2/map-web.webp',width:3072,height:2048,
    bytes:composition.web.bytes,sha256:composition.web.sha256,compositionSha256:sha(compositionBytes),reviewSha256:sha(reviewBytes),
    sectorCount:20,nativeRegionSize:[704,704],webEncoding:'lossless',sampling:'nearest',
    ownerSelectedStyle:true,ownerApproved:true,artApproved:true,approvalSha256:sha(approvalBytes),
    approvalScope:approval.scope,productionLayersApproved:false,exactFootprintVerified:false } };
}

export async function syncVanNgocClarity() {
  const { web,artwork } = await verifyVanNgocClarity();
  await mkdir(target,{recursive:true});
  await copyFile(web.path,resolve(target,'map-web.webp'));
  if (sha(await readFile(resolve(target,'map-web.webp')))!==artwork.sha256) fail('Delivery changed during copy');
  const metadata = JSON.stringify(artwork,null,2)+'\n';
  await writeFile(resolve(target,'artwork.json'),metadata);
  await writeFile(resolve(root,'client/src/hang-nhac-van-ngoc-detail-art.json'),metadata);
  console.log(`Prepared owner-approved ART baseline: 20 regions, 3072x2048, lossless WebP ${artwork.bytes} bytes.`);
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) await syncVanNgocClarity();
