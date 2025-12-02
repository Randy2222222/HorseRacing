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

  // Underlined tiny "a" = 3 (Brisnet race number 3)
  "\u0061\u0332": "3",  // a + underline
  "a\u0332": "3",
  "\u0332a": "3",
  "\u0332":  "3",       // underline on its own (PDF sometimes splits it)

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
  "\u0061\u0332": "³",
  "a\u0332": "³",
  "\u0332a": "³",
  "\u0332":  "³",
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
  "\u0332": "",     // remove underline combining mark
  "ª": "³",         // tiny-a glyph = superscript 3

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
