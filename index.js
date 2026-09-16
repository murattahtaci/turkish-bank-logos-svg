// turkish-bank-logos-svg — banka adından logoya.
//
//   import { findBankSlug, bankLogoUrl } from 'turkish-bank-logos-svg';
//   findBankSlug('T. GARANTİ BANKASI A.Ş.')  // 'garanti'
//   bankLogoUrl('T. GARANTİ BANKASI A.Ş.')   // '.../svg/garanti.svg'
//   findBankSlug('BİLİNMEYEN BANKA')                    // null — logo yok, adı yazın
import logos from './logos.js';

export { logos };

/**
 * Normalleştirilmiş banka adında aranan parça -> logo.
 *
 * SIRA ARTIK BELİRLEYİCİ DEĞİL: en UZUN eşleşen anahtar kazanır (eşitlikte adın
 * başına en yakın olan). Sıraya dayanan eski kural, adın tamamı yazılmadığında
 * yanlış bankayı veriyordu — "ziraat bank" → "ziraatbank" içinde "atbank" geçtiği
 * için A&T Bank dönüyordu (bildiren: Mehmet Utku ÖZTÜRK, 2026-09-15). Aynı tuzak
 * "abank" → "odeABANKası", "fibABANKa", "enparABANKaş"ta da vardı; uzunluk kuralı
 * bunların hepsini kapatıyor.
 *
 * Liste yine okunabilirlik için gruplu duruyor; yeni anahtar eklerken sıraya değil
 * ANLAMA bak: daha özel ad daha uzun anahtar demektir.
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
  ['ziraatbank', 'ziraat'], // "ziraat bank(a)" gibi eksik yazımlar
  ['ziraat', 'ziraat'],     // tek başına "ziraat" — katılım anahtarı daha uzun olduğu için onu gölgelemez
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
  ['tosla', 'tosla'],
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
  // En uzun eşleşme kazanır; eşitlikte adın başına yakın olan. Böylece kısa bir
  // anahtarın uzun bir adın içine denk gelmesi (zirATBANKası) sonucu değiştirmez.
  let en = null;
  for (const [part, slug] of MATCH) {
    const yer = n.indexOf(part);
    if (yer === -1) continue;
    if (!en || part.length > en.uzunluk || (part.length === en.uzunluk && yer < en.yer)) {
      en = { slug, uzunluk: part.length, yer };
    }
  }
  if (en) return SLUGS.has(en.slug) ? en.slug : null;

  // Yedek — kullanıcı kısa yazmış olabilir ("ing", "halk", "deniz"). Girdi bir slug'ın ya da
  // kurum adının ÖN EKİ ise ve tek aday varsa onu veririz. Ön ek şartı bilerek dar: "ABC
  // Holding A.Ş." içinde "ing" geçer ama hiçbir slug'ın öneki değildir, o yüzden eşleşmez.
  // Birden fazla aday varsa ("vakif" → VakıfBank / Vakıf Katılım) boş döner: yanlış logo
  // göstermektense adı yazmak doğru davranış.
  if (n.length < 3) return null;
  const adaylar = new Set();
  for (const l of logos) {
    if (l.slug.startsWith(n) || normalizeBankName(l.name).startsWith(n)) adaylar.add(l.slug);
  }
  return adaylar.size === 1 ? [...adaylar][0] : null;
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
