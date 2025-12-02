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
"\u0061\u0332": "³",
"«": "⁴",
"¬": "⁵",
"":  "⁶",   // invisible "" number 6
}
// Race 3 — underlined a (PDF splits it)
GLYPHS["\u0332"] = "³";      // underline alone
GLYPHS["a\u0332"] = "³";     // a + underline
GLYPHS["\u0332a"] = "³";     // underline + a

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
