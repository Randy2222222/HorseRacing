// glyphMap.js
// Converts Brisnet encoded glyphs → readable digits or text
// Uses TWO separate maps:
// 1) GLYPH_DIGITS = internal meaning for parser (normal digits)
// 2) GLYPHS       = display replacements (superscripts, symbols, etc.)

// ------------------------------------------------------------
// 1️⃣ INTERNAL DECODER MAP — parser logic only
//     These MUST be normal 0–9 digits, not superscripts.
// ------------------------------------------------------------
export const GLYPH_DIGITS = {
  "§": "0",
  "¨": "1",
  "©": "2",
  "ª": "3",      
  "«": "4",
  "¬": "5",
  "":  "6",             // Tiny 6 is invisible (PDF.js drops it)
  "®": "7",
  "¯": "8",
  "°": "9"
};

// Decode a single glyph → normal digit
export function decodeTinyNumber(sym) {
  if (sym in GLYPH_DIGITS) return GLYPH_DIGITS[sym];
  return null;
}


// ------------------------------------------------------------
// 2️⃣ VISUAL OUTPUT MAP — what the user SEES on screen
//     These CAN be superscripts, +/– markers, etc.
// ------------------------------------------------------------
export const GLYPHS = {

  // Superscript tiny digits (for display)
  "§": "⁰",
  "¨": "¹",
  "©": "²",
  "ª": "³",      // tiny-a glyph visually becomes superscript 3
  "«": "⁴",
  "¬": "⁵",
  
  "®": "⁷",
  "¯": "⁸",
  "°": "⁹",

  // Comment quality markers
  "ñ": "+",   // GOOD
  "×": "-",   // BAD

  // (Add more decoded symbols later as we discover them)
  // Tiny race-number glyph fixes
  // tiny-a split versions
  "a\u0332": "³",
  "\u0332a": "³",
  "\u0061\u0332": "³",
 "\u0332": "",     // remove underline combining mark

  // Fractions for Horse Lengths
  "‚": "¼",
  "▯": "½",
  "ƒ": "¾",
  "²": "hd",
  // Track Surface Turf, All Weather, PolyTrack
  "à": "Ⓣ",
  // Age Restriction Race
  "¦": "3↑",
  // (More glyphs will be added later)
};


// ------------------------------------------------------------
// 3️⃣ REPLACE ALL GLYPHS IN TEXT
// ------------------------------------------------------------
export function applyGlyphMap(text) {
  let out = text;

  for (let key in GLYPHS) {
    if (key === "") continue; // avoid replacing empty-string “6”
    const val = GLYPHS[key];
    out = out.split(key).join(val);
  }

  return out;
}
