// Koşum: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { findBankSlug, bankLogoUrl, normalizeBankName, logos, MATCH } from '../index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Ödeme sağlayıcılarının gerçekte döndürdüğü biçimler.
const ADLAR = [
  ['AKBANK T.A.Ş.', 'akbank'],
  ['TÜRKİYE İŞ BANKASI A.Ş.', 'isbank'],
  ['T. GARANTİ BANKASI A.Ş.', 'garanti'],
  ['YAPI VE KREDİ BANKASI A.Ş.', 'yapikredi'],
  ['QNB FİNANSBANK A.Ş.', 'qnb'],
  ['FİNANSBANK A.Ş.', 'qnb'],
  ['DENİZBANK A.Ş.', 'denizbank'],
  ['TÜRKİYE HALK BANKASI A.Ş.', 'halkbank'],
  ['T.C. ZİRAAT BANKASI A.Ş.', 'ziraat'],
  ['TÜRKİYE VAKIFLAR BANKASI T.A.O.', 'vakifbank'],
  ['VAKIFBANK', 'vakifbank'],
  ['TÜRK EKONOMİ BANKASI A.Ş.', 'teb'],
  ['ING BANK A.Ş.', 'ing'],
  ['HSBC BANK A.Ş.', 'hsbc'],
  ['ŞEKERBANK T.A.Ş.', 'sekerbank'],
  ['ODEA BANK A.Ş.', 'odeabank'],
  ['ODEABANK A.Ş.', 'odeabank'],
  ['FİBABANKA A.Ş.', 'fibabanka'],
  ['ANADOLUBANK A.Ş.', 'anadolubank'],
  ['BURGAN BANK A.Ş.', 'burgan'],
  ['ALTERNATİFBANK A.Ş.', 'alternatifbank'],
  ['AKTİF YATIRIM BANKASI A.Ş.', 'aktifbank'],
  ['ENPARA BANK A.Ş.', 'enpara'],
  ['CITIBANK A.Ş.', 'citibank'],
  ['ICBC TURKEY BANK A.Ş.', 'icbc'],
  ['ARAP TÜRK BANKASI A.Ş.', 'atbank'],
  ['PAPARA ELEKTRONİK PARA A.Ş.', 'papara'],
  ['ININAL ÖDEME VE ELEKTRONİK PARA A.Ş.', 'ininal'],
  ['N KOLAY', 'nkolay'],
  ['TURKISH BANK A.Ş.', 'freedombank'],
  ['FREEDOM BANK A.Ş.', 'freedombank'],
  // birbirini yiyebilecek çiftler
  ['ZİRAAT KATILIM BANKASI A.Ş.', 'ziraatkatilim'],
  ['T.C. ZİRAAT BANKASI', 'ziraat'],
  ['VAKIF KATILIM BANKASI A.Ş.', 'vakifkatilim'],
  ['TÜRKİYE VAKIFLAR BANKASI', 'vakifbank'],
  ['TÜRKİYE EMLAK KATILIM BANKASI A.Ş.', 'emlakkatilim'],
  ['KUVEYT TÜRK KATILIM BANKASI A.Ş.', 'kuveytturk'],
  ['TÜRKİYE FİNANS KATILIM BANKASI A.Ş.', 'turkiyefinans'],
  ['ALBARAKA TÜRK KATILIM BANKASI A.Ş.', 'albaraka'],
  ['HAYAT FİNANS KATILIM BANKASI A.Ş.', 'hayatfinans'],
  ['DÜNYA KATILIM BANKASI A.Ş.', 'dunyakatilim'],
  ['GOLDEN GLOBAL YATIRIM BANKASI A.Ş.', 'goldenglobal'],
  // eşleşmemesi gerekenler: logo yok, adı yazılır
  ['TOSLA', null],
  ['GETİR FİNANS', null],
  ['BİLİNMEYEN BANKA A.Ş.', null],
  ['', null],
  ['   ', null],
];

for (const [ad, beklenen] of ADLAR) {
  test(`findBankSlug(${JSON.stringify(ad)}) → ${beklenen}`, () => {
    assert.equal(findBankSlug(ad), beklenen);
  });
}

test('normalizeBankName Türkçe harfleri sadeleştirir', () => {
  assert.equal(normalizeBankName('T. GARANTİ BANKASI A.Ş.'), 'tgarantibankasias');
  assert.equal(normalizeBankName(null), '');
});

test('bankLogoUrl: slug, banka adı, verilen base ve eşleşmeyen ad', () => {
  assert.equal(bankLogoUrl('AKBANK T.A.Ş.', 'https://ornek.test/svg'), 'https://ornek.test/svg/akbank.svg');
  assert.equal(bankLogoUrl('garanti', 'https://ornek.test/svg/'), 'https://ornek.test/svg/garanti.svg');
  assert.match(bankLogoUrl('garanti'), /\/svg\/garanti\.svg$/);
  assert.equal(bankLogoUrl('TOSLA'), null);
});

test('her eşleme hedefinin logosu var', () => {
  const slugs = new Set(logos.map(l => l.slug));
  for (const [parca, slug] of MATCH) assert.ok(slugs.has(slug), `${parca} → ${slug}: logo yok`);
});

test('svg/, logos.json, logos.js ve README tablosu aynı 36 logoyu anlatıyor', () => {
  const dosyalar = readdirSync(join(root, 'svg')).filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4)).sort();
  const json = JSON.parse(readFileSync(join(root, 'logos.json'), 'utf8'));
  const readme = [...readFileSync(join(root, 'README.md'), 'utf8').matchAll(/^\| `([a-z0-9]+)\.svg` \|/gm)].map(m => m[1]).sort();
  assert.equal(dosyalar.length, 36);
  assert.deepEqual(json.map(l => l.slug).sort(), dosyalar);
  assert.deepEqual(logos.map(l => l.slug).sort(), dosyalar);
  assert.deepEqual(readme, dosyalar);
  assert.deepEqual(logos, json, 'logos.js bayat — npm run build');
  for (const l of logos) assert.ok(l.width > 0 && l.height > 0, `${l.slug}: boyut yok`);
});

test('bank-logos.css her logo için oranlı bir sınıf taşıyor', () => {
  const css = readFileSync(join(root, 'bank-logos.css'), 'utf8');
  for (const l of logos) {
    assert.ok(css.includes(`.bank-logo--${l.slug}{aspect-ratio:${l.width}/${l.height};background-image:url("svg/${l.slug}.svg")}`),
      `${l.slug}: CSS sınıfı yok ya da bayat — npm run build`);
  }
});
