// glyphMap.js
// Converts Brisnet encoded glyphs → readable text

export const GLYPHS = {

  export const GLYPH_DIGITS = {
  "§": "0",
  "¨": "1",
  "©": "2",
  "ª": "3",
  "«": "4",
  "¬": "5",
  "":  "6",   // invisible glyph = 6
  "®": "7",
  "¯": "8",
  "°": "9"

  // ---------- Distance Fractions ----------
  "Ë": "1/16",
  "Ë‡": "1/32",

    // ---------- Margins / Beaten Lengths ----------
  "©": "1",
  "³": ".75",
  "²": ".5",
  "ƒ": "nk",    // neck

  // ---------- Path Symbols ----------
  "": "p1",
  "": "p2",
  "": "p3",

  // ---------- Surface ----------
  "Ã": "T",     // Turf (Brisnet uses a weird Ã code for turf)
  // "D" will remain dirt
  // "AW" appears as letters normally

  // ---------- Pace/Class Symbols ----------
  "™": "",
  "‘": "",
  "’": "",

  // ---------- Just in case ----------
  "": "p1",
};

// Apply glyph replacements to text
export function applyGlyphMap(text) {
  let out = text;

  for (let key in GLYPHS) {
    const val = GLYPHS[key];
    out = out.split(key).join(val);
  }

  return out;
}
