#!/usr/bin/env node
// logos.json + svg/  ->  logos.json (boyutlar eklenir) · logos.js · bank-logos.css
// Kullanım: npm run build   (bağımlılık yok, Node 18+)
// Tek kaynak logos.json'dır; logos.js ve bank-logos.css elle düzenlenmez.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logos = JSON.parse(readFileSync(join(root, 'logos.json'), 'utf8'));

const dosyalar = readdirSync(join(root, 'svg')).filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4));
const kayitli = new Set(logos.map(l => l.slug));
const kayitsiz = dosyalar.filter(s => !kayitli.has(s));
const dosyasiz = logos.filter(l => !dosyalar.includes(l.slug)).map(l => l.slug);
if (kayitsiz.length || dosyasiz.length) {
  console.error(`logos.json ile svg/ uyuşmuyor — kaydı olmayan dosya: ${kayitsiz.join(', ') || '-'} · dosyası olmayan kayıt: ${dosyasiz.join(', ') || '-'}`);
  process.exit(1);
}

const yuvarla = x => Math.round(x * 1000) / 1000;
const sonuc = logos.map(l => {
  const svg = readFileSync(join(root, 'svg', l.slug + '.svg'), 'utf8');
  const m = svg.match(/<svg\b[^>]*?\bviewBox\s*=\s*["']\s*(-?[\d.]+(?:e[-+]?\d+)?)[\s,]+(-?[\d.]+(?:e[-+]?\d+)?)[\s,]+([\d.]+(?:e[-+]?\d+)?)[\s,]+([\d.]+(?:e[-+]?\d+)?)/i);
  if (!m) { console.error(`${l.slug}.svg: kökte viewBox yok`); process.exit(1); }
  const width = yuvarla(+m[3]), height = yuvarla(+m[4]);
  if (!(width > 0 && height > 0)) { console.error(`${l.slug}.svg: geçersiz viewBox`); process.exit(1); }
  if (!['bank', 'payment'].includes(l.type)) { console.error(`${l.slug}: tür (type) 'bank' ya da 'payment' olmalı`); process.exit(1); }
  return { slug: l.slug, name: l.name, type: l.type, file: `svg/${l.slug}.svg`, width, height, source: l.source, license: l.license };
}).sort((a, b) => a.slug.localeCompare(b.slug));

writeFileSync(join(root, 'logos.json'), JSON.stringify(sonuc, null, 2) + '\n');

writeFileSync(join(root, 'logos.js'),
  '// scripts/build.mjs tarafından logos.json\'dan üretildi — elle düzenlemeyin.\n' +
  'export default ' + JSON.stringify(sonuc, null, 2) + ';\n');

const css = [
  '/* turkish-bank-logos-svg — scripts/build.mjs tarafından üretildi, elle düzenlemeyin.',
  '   Kullanım: <span class="bank-logo bank-logo--garanti" role="img" aria-label="Garanti BBVA"></span>',
  '   Yükseklik 24px; değiştirmek için .bank-logo{height:…}. Genişlik logonun oranından gelir. */',
  '.bank-logo{display:inline-block;height:24px;vertical-align:middle;background:center/contain no-repeat}',
  ...sonuc.map(l => `.bank-logo--${l.slug}{aspect-ratio:${l.width}/${l.height};background-image:url("svg/${l.slug}.svg")}`),
  '',
].join('\n');
writeFileSync(join(root, 'bank-logos.css'), css);

console.log(`${sonuc.length} logo · logos.json · logos.js · bank-logos.css yazıldı`);
