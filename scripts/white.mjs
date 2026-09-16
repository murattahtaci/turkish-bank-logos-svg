// svg/<slug>.svg  ->  svg-white/<slug>.svg: koyu zemin için düz beyaz sürüm.
//
// Logonun çizimine dokunulmaz; içerik bir SVG filtresinin içine alınır:
//   - neredeyse saf beyaz her piksel (R+G+B >= ~2,95) BOŞLUK olur — HSBC'nin altıgeni,
//     TEB'in kutusu, VakıfBank'ın V'si beyaz bir lekeye dönmesin diye;
//   - geri kalan her şey (renk, degrade, gömülü resim) düz beyaz olur;
//   - kenar yumuşatma korunur: sonuç alfa = maske × kaynak alfa.
// Beyazlık, logo SİYAH zemine oturtulduktan sonra ölçülür. Doğrudan ölçülünce ince ve açık
// renkli çizgilerin neredeyse saydam kenar pikselleri beyaz sayılıyor ve boşluğa dönüyordu
// (enpara'nın ".com"u 26 px'te kopuktu, 48 px'te temizdi).
// Yalnız CSS ile boyamak (filter: brightness(0) invert(1)) iç boşluklu beş logoyu bozuyor
// (Alternatifbank, enpara, HSBC, TEB, VakıfBank).
//
// Alfa = 60·A − 20·(R+G+B). Daha yumuşak eşik (12·A − 4·toplam) Fibabanka elmasındaki
// açık renkli parlamayı yarı saydam bırakıp gri bir çizgi üretiyordu.

const ID = 'tbl-white';

// Rengiyle ayrılan parçalar düz beyazda kaynaşıyor (TEB'in karesi ile leylekleri, Freedom Bank'ın
// kalkanı ile F'si, ABank'ın turuncu bacağı ile A'sı, enpara'nın halkası ile yazısı). Bu logolarda
// arka şekil YARI SAYDAM beyaz, işaret tam beyaz olur. Saf eflatun (#FF00FF) filtrede %40 beyaz demek;
// sette hiçbir logoda yok (en yakını Vakıf Katılım pembesi, eşiğin çok altında). Saydamlık yerine renk
// kullanılıyor çünkü Freedom Bank'ta F ayrı bir şekil değil: tam kalkanın üstüne koyu parça çizilmiş,
// alttaki opak kalkan saydamlığı yutuyordu. Her değişiklik kaynakta birebir bulunmak zorunda;
// kaynak değişirse build durur.
const YARI = '#FF00FF';
export const TON_AYARI = {
  teb: [
    ['fill="rgb(0%, 65.644836%, 43.792725%)"', `fill="${YARI}"`],                  // yeşil kare
    ['fill="rgb(100%, 100%, 100%)" fill-opacity="1"', 'fill="#000000" fill-opacity="1"'], // leylekler
  ],
  freedombank: [
    ['fill="#0D532F"', `fill="${YARI}"`],   // koyu parça (tam kalkanın üstünde)
    ['fill="#51AE3D"', 'fill="#000000"'],   // tam kalkan; koyu parçanın dışında kalan F olur
  ],
  alternatifbank: [
    ['fill="#d78234"', `fill="${YARI}"`],   // turuncu bacak
  ],
  enpara: [
    // halka parçaları farklı renkli ve sınıfları yazıyla ortak; renk değiştirmek yerine grup saydamlığı
    ['<path id="XMLID_66_"', '<g opacity="0.4"><path id="XMLID_66_"'],
    ['<path id="XMLID_58_"', '</g><path id="XMLID_58_"'],   // iç daire (boşluk) grubun dışında
  ],
};

export function tonla(svg, slug) {
  for (const [eski, yeni] of TON_AYARI[slug] ?? []) {
    if (!svg.includes(eski)) throw new Error(`${slug}: ton ayarı kaynakta bulunamadı: ${eski}`);
    svg = svg.split(eski).join(yeni);
  }
  return svg;
}

export function whiteSvg(svg, slug = 'svg') {
  svg = tonla(svg, slug);   // ÖNCE: aşağıdaki konumlar tonlanmış metne göre hesaplanmalı
  const kok = /<svg\b[^>]*>/.exec(svg);
  if (!kok) throw new Error(`${slug}: <svg> kök etiketi yok`);
  const son = svg.lastIndexOf('</svg>');
  if (son < kok.index + kok[0].length) throw new Error(`${slug}: </svg> yok`);
  const vb = /\bviewBox\s*=\s*["']\s*(-?[\d.]+(?:e[-+]?\d+)?)[\s,]+(-?[\d.]+(?:e[-+]?\d+)?)[\s,]+([\d.]+(?:e[-+]?\d+)?)[\s,]+([\d.]+(?:e[-+]?\d+)?)/i.exec(kok[0]);
  if (!vb) throw new Error(`${slug}: kökte viewBox yok`);
  if (svg.includes(`id="${ID}"`)) throw new Error(`${slug}: "${ID}" kimliği dosyada zaten var`);
  const [, x, y, w, h] = vb;
  const ac = kok.index + kok[0].length;
  return svg.slice(0, ac)
    + `<defs><filter id="${ID}" x="${x}" y="${y}" width="${w}" height="${h}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`
    + '<feFlood flood-color="#000" result="siyah"/>'
    + '<feComposite in="SourceGraphic" in2="siyah" operator="over" result="zemin"/>'
    + '<feColorMatrix in="zemin" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -20 -20 -20 60 0" result="dolu"/>'
    + '<feColorMatrix in="zemin" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  5 -10 5 0 -8" result="eflatun"/>'
    + '<feComposite in="eflatun" in2="dolu" operator="arithmetic" k1="0" k2="-0.6" k3="1" k4="0" result="m"/>'
    + '<feComposite in="m" in2="SourceAlpha" operator="in"/>'
    + `</filter></defs><g filter="url(#${ID})">`
    + svg.slice(ac, son)
    + '</g></svg>\n';
}
