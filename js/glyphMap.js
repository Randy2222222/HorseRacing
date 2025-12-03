export const GLYPH_VISUAL = {
  // tiny digits → superscripts
  "§": "⁰",
  "¨": "¹",
  "©": "²",
  "ª": "³",
  "«": "⁴",
  "¬": "⁵",
  "®": "⁷",
  "¯": "⁸",
  "°": "⁹",

  // your four special cases:
  "a\u0332": "³",
  "\u0332a": "³",
  "\u0061\u0332": "³",
  "\u0332": "",         // remove stray underline

  // comments
  "ñ": "+",
  "×": "-",

  // surface & ages
  "à": "Ⓣ",
  "¦": "3↑",
  "¡": "4↑"
  // (no margins here)
};

export const GLYPH_MARGINS = {
  "‚": { display: "¼", value: 0.25 },
  "▯": { display: "½", value: 0.50 },
  "ƒ": { display: "¾", value: 0.75 },
  "¹": { display: "ns", value: 0.05 },
  "²": { display: "hd", value: 0.175 },
  "³": { display: "nk", value: 0.21 }
};

export function applyGlyphMap(text) {
  let out = text;

  for (let key in GLYPH_VISUAL) {
    if (key === "") continue;
    out = out.split(key).join(GLYPH_VISUAL[key]);
  }

  return out;
}
