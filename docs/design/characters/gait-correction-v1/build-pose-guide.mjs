import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = dirname(fileURLToPath(import.meta.url));
const directionArg = process.argv.indexOf('--direction');
const direction = directionArg >= 0 ? process.argv[directionArg + 1] : 'east';
if (!['east','west','south','north'].includes(direction)) throw new Error('Unknown direction');
const phases = ['CONTACT A', 'DOWN A', 'PASSING B', 'UP B', 'CONTACT B', 'DOWN B', 'PASSING A', 'UP A'];
const nearLeg = [ [[12,66],[22,86]], [[10,70],[14,86]], [[2,68],[2,86]], [[-5,65],[-11,86]], [[-14,62],[-21,82]], [[-16,62],[-22,77]], [[12,61],[8,72]], [[16,58],[18,77]] ];
const farLeg = [nearLeg[4],nearLeg[5],nearLeg[6],nearLeg[7],nearLeg[0],nearLeg[1],nearLeg[2],nearLeg[3]];
const nearArm = [ [[-5,40],[-15,48]], [[-4,42],[-10,49]], [[1,40],[0,50]], [[6,36],[12,43]], [[6,37],[15,43]], [[5,38],[10,44]], [[1,40],[0,50]], [[-5,42],[-10,49]] ];
const farArm = [nearArm[4],nearArm[5],nearArm[6],nearArm[7],nearArm[0],nearArm[1],nearArm[2],nearArm[3]];
const bob = [0,2,0,-2,0,2,0,-2];
const colors = {near:'#0099b6', far:'#d2751e', torso:'#434e59'};
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="#faf8f2"/><text x="24" y="30" font-family="Arial" font-size="16" fill="#273b41">${direction.toUpperCase()} WALK: same-side arm moves opposite to the leg</text><text x="24" y="53" font-family="Arial" font-size="12" fill="#53616a">CYAN = one arm + same-side leg. ORANGE = opposite side. Colors label anatomy, not costume.</text>`;
function limb(start, joints, color) { return `<polyline points="${[start,...joints].map(p=>p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`; }
function shoe(joints, color) { const [x,y]=joints[1]; return `<path d="M${x-3},${y} L${x+9},${y+2}" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>`; }
for (let i=0;i<8;i++) {
  const x=120+(i%4)*240,y=110+Math.floor(i/4)*265;
  svg += `<text x="${x}" y="${y-18}" text-anchor="middle" font-family="Arial" font-size="13" fill="#273b41">${i}: ${phases[i]}</text><g transform="translate(${x},${y}) scale(2)"><path d="M-42,90H45" stroke="#c6c0ae" stroke-width=".8"/>`;
  if (direction==='east'||direction==='west') {
    if(direction==='west')svg+='<g transform="scale(-1,1)">';
    svg += limb([0,25+bob[i]],farArm[i],colors.far)+limb([0,48+bob[i]],farLeg[i],colors.far)+shoe(farLeg[i],colors.far);
    svg += `<path d="M0,22 L0,${48+bob[i]}" stroke="${colors.torso}" stroke-width="6"/><circle cx="0" cy="${11+bob[i]}" r="10" fill="none" stroke="${colors.torso}" stroke-width="3"/><path d="M8,${9+bob[i]} L13,${13+bob[i]} L8,${15+bob[i]}" fill="none" stroke="${colors.torso}" stroke-width="2"/>`;
    svg += limb([0,25+bob[i]],nearArm[i],colors.near)+limb([0,48+bob[i]],nearLeg[i],colors.near)+shoe(nearLeg[i],colors.near);
    if(direction==='west')svg+='</g>';
  } else {
    const depth=direction==='south'?1:-1;
    const project=(joints,side,isArm)=>joints.map(([xx,yy])=>[side*(isArm?11:6)+xx*.08,yy+depth*xx*(isArm?.45:.25)]);
    const na=project(nearArm[i],1,true),fa=project(farArm[i],-1,true),nl=project(nearLeg[i],1,false),fl=project(farLeg[i],-1,false);
    svg+=limb([-10,25+bob[i]],fa,colors.far)+limb([-5,48+bob[i]],fl,colors.far);
    svg+=`<path d="M-9,25L9,25M0,22L0,${48+bob[i]}M-5,${48+bob[i]}H5" stroke="${colors.torso}" stroke-width="5"/><circle cx="0" cy="${11+bob[i]}" r="10" fill="none" stroke="${colors.torso}" stroke-width="3"/>`;
    if(direction==='south')svg+=`<circle cx="-4" cy="${10+bob[i]}" r="1.2" fill="${colors.torso}"/><circle cx="4" cy="${10+bob[i]}" r="1.2" fill="${colors.torso}"/>`;
    svg+=limb([10,25+bob[i]],na,colors.near)+limb([5,48+bob[i]],nl,colors.near);
    for(const [joints,color] of [[nl,colors.near],[fl,colors.far]]){const [xx,yy]=joints[1];svg+=`<path d="M${xx-4},${yy}H${xx+4}" stroke="${color}" stroke-width="5"/>`;}
  }
  svg+='</g>';
}
svg += '</svg>';
const source = resolve(root, `${direction}-pose-guide.svg`);
await writeFile(source,svg,'utf8');
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try { const page=await browser.newPage({viewport:{width:960,height:640},deviceScaleFactor:1}); await page.goto(new URL(`file:///${source.replaceAll('\\','/')}`).href); await page.screenshot({path:resolve(root,`${direction}-pose-guide.png`)}); }
finally { await browser.close(); }
console.log('Saved editable pose guide and PNG reference. This is a planning diagram, not game ART.');
