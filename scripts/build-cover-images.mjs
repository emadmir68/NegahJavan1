import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { coverSvg, coverVariant } from '../src/cover.js';

const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch {
  if (!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw new Error('Install sharp to rebuild graphic covers.');
  sharp = require(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'sharp'));
}
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const categories = ['politics','incidents','world','economy','society','technology','culture','sports','general'];
const images = {};
let bytes = 0;
for (const category of categories) {
  images[category] = [];
  for (let index = 0; images[category].filter(Boolean).length < 3; index++) {
    const title = category + ' ' + index;
    const variant = coverVariant(title);
    if (images[category][variant]) continue;
    const png = await sharp(Buffer.from(coverSvg(category, title))).resize(960,540).png({palette:true,colours:128,dither:0,compressionLevel:9}).toBuffer();
    images[category][variant] = png.toString('base64');
    bytes += png.length;
  }
}
await mkdir(join(root,'src'),{recursive:true});
await writeFile(join(root,'src/cover-images.js'),'// Generated from cover.js by scripts/build-cover-images.mjs.\nexport const coverImages = '+JSON.stringify(images)+';\n');
console.log(JSON.stringify({covers:categories.length * 3,pngBytes:bytes,moduleBytes:JSON.stringify(images).length}));
