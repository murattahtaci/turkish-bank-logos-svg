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

export function whiteSvg(svg, slug = 'svg') {
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
    + '<feColorMatrix in="zemin" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -20 -20 -20 60 0" result="m"/>'
    + '<feComposite in="m" in2="SourceAlpha" operator="in"/>'
    + `</filter></defs><g filter="url(#${ID})">`
    + svg.slice(ac, son)
    + '</g></svg>\n';
}
