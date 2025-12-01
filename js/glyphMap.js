// glyphMap.js
// Brisnet tiny-number cipher: converts glyph → digit (0–9)

export const GLYPH_DIGITS = {
  "§": 0,   // tiny 0
  "¨": 1,   // tiny 1
  "©": 2,   // tiny 2
  "ª": 3,   // tiny 3
  "«": 4,   // tiny 4
  "¬": 5,   // tiny 5
  "":  6,   // tiny 6 (invisible or dropped by PDF.js)
  "®": 7,   // tiny 7
  "¯": 8,   // tiny 8
  "°": 9    // tiny 9
};

// Decode a single glyph character into a digit
export function decodeTinyNumber(sym) {
  if (sym in GLYPH_DIGITS) {
    return GLYPH_DIGITS[sym];
  }
  return null; // unknown symbol
}
