// glyphMap.js
// Converts Brisnet encoded glyphs → readable digits or text
// SAFE version using Unicode escapes (no corrupted symbols)

// ------------------------------
// Tiny-number cipher (Race Numbers)
// ------------------------------
export const GLYPH_DIGITS = {
// Tiny race-number 
// tiny numbers → superscripts
"§": "⁰",
"¨": "¹",
"©": "²",
"\u0061\u0332": "³",
"a\u0332": "³",
"\u0332a": "³",
"\u0332": "³",
"«": "⁴",
"¬": "⁵",
"":  "⁶",     // careful — only used in GLYPH_DIGITS, not GLYPHS
"®": "⁷",
"¯": "⁸",
"°": "⁹",
}

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
// ------------------------------
// Comment Quality Markers
// ------------------------------
"ñ": "+",    // GOOD comment (positive)
"×": "-",
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
