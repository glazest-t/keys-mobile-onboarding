import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {screens as classic} from '../app/screens.js';
import {screens as alternate} from '../app/screens-v2.js';
import {slides as orbitSlides} from '../app/variant-two.js';
const root=resolve(import.meta.dirname,'..');
const mime={'.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
async function embed(text){
 const paths=[...new Set(text.match(/\.\/assets\/[\w/.-]+\.(?:svg|jpg|png|webp|woff2)/g)||[])];
 for(const path of paths){const bytes=await readFile(resolve(root,path));text=text.split(path).join(`data:${mime[extname(path)]};base64,${bytes.toString('base64')}`);}
 return text;
}
let html=await readFile(resolve(root,'index.html'),'utf8');
for(const path of ['fonts.css','app/variant-one.css','app/prototype.css'])html=html.replace(`<link rel="stylesheet" href="./${path}">`,`<style>${await embed(await readFile(resolve(root,path),'utf8'))}</style>`);
html=html.replace(/<script type="module"[^>]+><\/script>/,'').replace('href="./index.html"','href="?variant=1&step=1"');
const icons=(await readFile(resolve(root,'app/icons.js'),'utf8')).replace('export const icon','const icon');
const logic=(await readFile(resolve(root,'app/prototype.js'),'utf8')).replace(/^import .*;\n/gm,'');
const script=await embed(`${icons}\nconst classic=${JSON.stringify(classic)};\nconst alternate=${JSON.stringify(alternate)};\nconst orbitSlides=${JSON.stringify(orbitSlides)};\n${logic}`);
html=await embed(html);
html=html.replace('</body>',`<script>${script.replace(/<\/script/gi,'<\\/script')}</script></body>`);
html=html.replace(/^[ \t]+$/gm,'');
await writeFile(resolve(root,'prototype.html'),html);
console.log(`prototype.html: ${(Buffer.byteLength(html)/1024/1024).toFixed(1)} MB, all assets embedded`);
