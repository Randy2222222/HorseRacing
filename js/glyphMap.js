
// glyphMap.js
// Converts Brisnet encoded glyphs → readable digits or text
// Uses three maps:
//
// 1) GLYPH_DIGITS   = internal tiny-number → normal digit (for parser logic)
// 2) GLYPHS         = what you SEE in decoded text (superscripts, symbols)
// 3) GLYPH_MARGINS  = beaten-length symbols → { display, value }

// ------------------------------------------------------------
// 1️⃣ INTERNAL DECODER MAP — parser logic ONLY
//     MUST be normal digits "0"–"9" (no superscripts here)
// ------------------------------------------------------------
export const GLYPH_DIGITS = {
  "§": "0",
  "¨": "1",
  "©": "2",
  "ª": "3",      // tiny 3 (race #3, leader 1/4 etc.)
  "«": "4",
  "¬": "5",
  //"6": "⁶",    // no entry for 6 — PDF.js drops that glyph, nothing we can do
  "®": "7",
  "¯": "8",
  "°": "9",
};

// Decode a single glyph → normal digit
export function decodeTinyNumber(sym) {
  if (sym in GLYPH_DIGITS) return GLYPH_DIGITS[sym];
  return null;
}


// ------------------------------------------------------------
// 2️⃣ VISUAL OUTPUT MAP — what shows in DECODED TEXT panel
//     This is where we use superscripts, ns/hd/nk, Ⓣ, 3↑, 4↑, etc.
// ------------------------------------------------------------
export const GLYPHS = {

  // Tiny race / time numbers → superscripts
  "§": "⁰",
  "¨": "¹",
  "©": "²",
  "ª": "³",      // tiny-a precomposed
  "«": "⁴",
  "¬": "⁵",
 // "6": "⁶",
  "®": "⁷",
  "¯": "⁸",
  "°": "⁹",
// Tiny-3 weird split forms (underline + a combos)
  "a\u0332": "³",
  // Distance Fractions
  "ˆ": "¹⁄₁₆", 
  "„": "⅛",
  "‰": "³⁄₁₆",
  "‚": "¼",
  "Š": "⁵⁄₁₆",
  "…": "⅜",
  "\u0081": "½",
  "Ñ": "⅝",
  "ƒ": "¾",
  // Fractions for horse lengths (display)
 // "‚": "¼",
 // "\u0081": "½",
 // "ƒ": "¾",
  // Nose / Head / Neck display
  //"¹": "ns",
  //"²": "hd",
  //"³": "nk",

  // Track surface: Turf symbol (circle T)
  "à": "Ⓣ",
  "Ì": "Ⓐ",
  "š": "ⓧ",
  //"•": "ⓓ",
  "•": "🅃",
  "æ": "�",

  // Age restrictions
  "¦": "3↑",
  "¡": "4↑",

  // Comment quality markers
  "ñ": "+",   // good comment
  "×": "-",   // bad comment

  // Racetype
  "™": "Ⓕ",
  "‘": "🅂",
};

// ------------------------------------------------------------
// 3️⃣ LENGTH MAP — for math (SPL/LPS etc.)
//     You can import this separately when you do margin math.
// ------------------------------------------------------------
//export const GLYPH_MARGINS = {
  // length fractions
//  "‚": { display: "¼", value: 0.25 },
 // "\u0081": { display: "½", value: 0.50 },
 // "ƒ": { display: "¾", value: 0.75 },

  // nose / head / neck

 // "¹": { display: "ns", value: 0.05 },
 // "²": { display: "hd", value: 0.175 },
  //"³": { display: "nk", value: 0.21 }
//};


// ------------------------------------------------------------
// 4️⃣ Apply glyph replacements to the whole text
//     NOTE: this only uses GLYPHS (visual map), NOT GLYPH_MARGINS.
// ------------------------------------------------------------
export function applyGlyphMap(text) {
  let out = text;

  for (let key in GLYPHS) {
    if (key === "") continue; // (we never mapped "" here anyway)
    const val = GLYPHS[key];
    out = out.split(key).join(val);
  }

  return out;
}
