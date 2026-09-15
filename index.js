// turkish-bank-logos-svg — banka adından logoya.
//
//   import { findBankSlug, bankLogoUrl } from 'turkish-bank-logos-svg';
//   findBankSlug('T. GARANTİ BANKASI A.Ş.')  // 'garanti'
//   bankLogoUrl('T. GARANTİ BANKASI A.Ş.')   // '.../svg/garanti.svg'
//   findBankSlug('TOSLA')                    // null — logo yok, adı yazın
import logos from './logos.js';

export { logos };

/**
 * Normalleştirilmiş banka adında aranan parça -> logo. SIRA ÖNEMLİ, ilk eşleşen kazanır:
 * - katılım bankaları önce ("ziraatkatilim" "ziraat"tan, "vakifkatilim" "vakif"tan önce),
 * - başka adların İÇİNDE geçen kısa anahtarlar en sonda: "abank" → "odeABANKası",
 *   "fibABANKa", "enparABANKaş"; "atbank" → "zirATBANKası".
 */
export const MATCH = [
  // katılım bankaları
  ['ziraatkatilim', 'ziraatkatilim'],
  ['vakifkatilim', 'vakifkatilim'],
  ['emlakkatilim', 'emlakkatilim'],
  ['turkiyeemlakkatilim', 'emlakkatilim'],
  ['turkiyefinans', 'turkiyefinans'],
  ['kuveytturk', 'kuveytturk'],
  ['albaraka', 'albaraka'],
  ['hayatfinans', 'hayatfinans'],
  ['dunyakatilim', 'dunyakatilim'],
  ['goldenglobal', 'goldenglobal'],
  ['terabank', 'terabank'],
  ['terayatirim', 'terabank'],
  // mevduat bankaları ve e-para kuruluşları
  ['ziraatbankasi', 'ziraat'],
  ['tcziraat', 'ziraat'],
  ['halkbank', 'halkbank'],
  ['turkiyehalkbankasi', 'halkbank'],
  ['vakifbank', 'vakifbank'],
  ['turkiyevakiflar', 'vakifbank'],
  ['isbankasi', 'isbank'],
  ['turkiyeisbankasi', 'isbank'],
  ['garanti', 'garanti'],
  ['akbank', 'akbank'],
  ['yapikredi', 'yapikredi'],
  ['yapivekredi', 'yapikredi'],
  ['qnb', 'qnb'],
  ['finansbank', 'qnb'],
  ['denizbank', 'denizbank'],
  ['turkekonomi', 'teb'],
  ['ingbank', 'ing'],
  ['hsbc', 'hsbc'],
  ['sekerbank', 'sekerbank'],
  ['alternatifbank', 'alternatifbank'],
  ['anadolubank', 'anadolubank'],
  ['fibabanka', 'fibabanka'],
  ['odeabank', 'odeabank'],
  ['burganbank', 'burgan'],
  ['aktifbank', 'aktifbank'],
  ['aktifyatirim', 'aktifbank'],
  ['nkolay', 'nkolay'],
  ['enpara', 'enpara'],
  ['citibank', 'citibank'],
  ['icbc', 'icbc'],
  ['arapturk', 'atbank'],
  ['freedombank', 'freedombank'],
  ['turkishbank', 'freedombank'], // 2026'da Freedom Bank oldu
  ['papara', 'papara'],
  ['ininal', 'ininal'],
  ['getirfinans', 'getirfinans'],
  ['iyzi', 'iyzico'], // iyzico'nun kendi BIN sorgusu "iyzico", BIN veri tabanları "İyzi Ödeme ve Elektronik Para…" diyor
  // kısa anahtarlar EN SONDA
  ['atbank', 'atbank'],
  ['abank', 'alternatifbank'],
  ['teb', 'teb'],
];

const TR = { 'İ': 'i', 'I': 'i', 'ı': 'i', 'Ş': 's', 'ş': 's', 'Ğ': 'g', 'ğ': 'g',
  'Ü': 'u', 'ü': 'u', 'Ö': 'o', 'ö': 'o', 'Ç': 'c', 'ç': 'c' };

/** "T. GARANTİ BANKASI A.Ş." -> "tgarantibankasias" */
export function normalizeBankName(name) {
  return String(name ?? '').trim()
    .replace(/[İIıŞşĞğÜüÖöÇç]/g, c => TR[c])
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const SLUGS = new Set(logos.map(l => l.slug));

/** Banka adını logo adına (slug) çevirir; eşleşme yoksa null. */
export function findBankSlug(name) {
  const n = normalizeBankName(name);
  if (!n) return null;
  for (const [part, slug] of MATCH) {
    if (n.includes(part)) return SLUGS.has(slug) ? slug : null;
  }
  return null;
}

const DEFAULT_BASE = new URL('./svg/', import.meta.url).href;

/**
 * Logonun adresi. Slug ('garanti') ya da banka adı ('T. GARANTİ BANKASI A.Ş.') alır;
 * eşleşme yoksa null. base verilmezse bu dosyanın yanındaki svg/ klasörü kullanılır.
 */
export function bankLogoUrl(slugOrName, base = DEFAULT_BASE) {
  const slug = SLUGS.has(slugOrName) ? slugOrName : findBankSlug(slugOrName);
  if (!slug) return null;
  return base.replace(/\/?$/, '/') + slug + '.svg';
}
