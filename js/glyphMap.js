// glyphMap.js
// Brisnet tiny-number cipher: converts glyph → digit (0–9)

// ONLY YOUR DIGIT MAP — LEAVE THIS AS IS
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
};

// Decode a single glyph into a digit
export function decodeTinyNumber(sym) {
  return GLYPH_DIGITS[sym] ?? null;
}

// REQUIRED — pdfReader IMPORTS THIS
// Minimal safe version: does nothing except return text
export function applyGlyphMap(text) {
  return text;
}
