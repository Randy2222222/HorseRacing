// glyphMap.js
// Converts Brisnet encoded glyphs → readable digits or text
// SAFE version using Unicode escapes (no corrupted symbols)

// ------------------------------
// Tiny-number cipher (Race Numbers)
// ------------------------------
export const GLYPH_DIGITS = {
  // Tiny race-number output (superscripts)
"§": "⁰",
"¨": "¹",
"©": "²",
"ª": "³",
"«": "⁴",
"¬": "⁵",
"":  "⁶",   // invisible glyph = Race 6
"®": "⁷",
"¯": "⁸",
"°": "⁹",
// ------------------------------
// Comment Quality Markers
// ------------------------------
"ñ": "+",    // GOOD comment (positive)
};

// Decode a single glyph → digit
export function decodeTinyNumber(sym) {
  if (sym in GLYPH_DIGITS) {
    return GLYPH_DIGITS[sym];
  }
  return null;
}


// ------------------------------
// Full glyph replacement map
// (add more later as you decode them)
// ------------------------------
export const GLYPHS = {

  // digits
  "§": "0",
  "¨": "1",
  "©": "2",
  "\u0061\u0332": "3",
  "«": "4",
  "¬": "5",
  "":  "6",
  "®": "7",
  "¯": "8",
  "°": "9",

  // Fraction symbols (if Brisnet outputs them later)
  "Ë": "1/16",
  "Ë‡": "1/32",

  // Margins (beaten lengths)
  "³": ".75",
  "²": ".5",
  "ƒ": "nk",

  // Path symbols — still verifying
  "": "p1",
  "": "p2",
  "": "p3",

  // Surface symbols (Brisnet turf code)
  "Ã": "T",

  // Extra placeholders — harmless
  "™": "",
  "‘": "",
  "’": ""
};


// ------------------------------
// Apply replacements to entire text
// ------------------------------
export function applyGlyphMap(text) {
  let out = text;

  for (let key in GLYPHS) {
    if (key === "") continue; // skip empty key (Race 6)
    const val = GLYPHS[key];
    out = out.split(key).join(val);
  }

  return out;
}
