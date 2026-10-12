// Code-native geometry guides, never used as final UI artwork. ImageGen paints the final raster assets.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),folder=resolve(root,'docs/design/ui/dao-dual-theme-v1/guides');
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
await mkdir(folder,{recursive:true});
const scale=2172/760,header=(width,height)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
// Functional apertures match the existing display overlay, while the outside form is a new restrained bezel.
const hud=header(2172,724)+`<g transform="translate(0 159) scale(${scale})" fill="#7f958a" stroke="#465c52" stroke-width="2"><path fill-rule="evenodd" d="M156 57H604V112H156Z M164 64H596V102H164Z"/><path fill-rule="evenodd" d="M153.5 73.5a52 52 0 1 0-104 0a52 52 0 1 0 104 0 M135 73.5a33.5 33.5 0 1 1-67 0a33.5 33.5 0 1 1 67 0"/><path fill-rule="evenodd" d="M710.5 73.5a52 52 0 1 0-104 0a52 52 0 1 0 104 0 M692 73.5a33.5 33.5 0 1 1-67 0a33.5 33.5 0 1 1 67 0"/><path d="M139 56 161 58V109L138 112M621 56 599 58V109L622 112"/><path d="M368 54V42L380 35 392 42V54Z"/></g></svg>`;
const window=header(1254,1254)+`<path fill="#7f958a" stroke="#465c52" stroke-width="4" fill-rule="evenodd" d="M76 90 100 66H1154L1178 90V1164L1154 1188H100L76 1164Z M131 136H1123V1118H131Z"/><g fill="#465c52"><path d="M66 76H158V117H107V166H66ZM1188 76H1096V117H1147V166H1188ZM66 1178H158V1137H107V1088H66ZM1188 1178H1096V1137H1147V1088H1188Z"/></g></svg>`;
const button=header(2172,724)+`<path fill="#5d776b" stroke="#354e47" stroke-width="16" d="M166 226 204 188H1968L2006 226V498L1968 536H204L166 498Z"/><path fill="none" stroke="#879788" stroke-width="8" d="M246 238H1926V486H246Z"/></svg>`;
for(const [id,svg] of [['hud',hud],['window',window],['button',button]]){await writeFile(resolve(folder,id+'.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(resolve(folder,id+'.png'));}
console.log('Created geometry-only alpha guides for three new UI assets.');
