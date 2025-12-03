// glyphMap.js
// Converts Brisnet encoded glyphs → readable digits or text
// Uses TWO separate maps:
// 1) GLYPH_DIGITS = internal meaning for parser (normal digits)
// 2) GLYPHS       = visual replacements (superscripts, lengths, etc.)

// ------------------------------------------------------------
// 1️⃣ INTERNAL DECODER MAP — parser logic only
//     MUST be NORMAL digits 0–9
// ------------------------------------------------------------
export const GLYPH_DIGITS = {
  "§": "0",
  "¨": "1",
  "©": "2",
  "ª": "3",    
  "«": "4",
  "¬": "5",
  "":  "6",            // invisible tiny-6
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
// 2️⃣ VISUAL OUTPUT MAP — WHAT SHOWS ON SCREEN
// ------------------------------------------------------------
export const GLYPHS = {

  // --- Superscript tiny digits (DISPLAY only) ---
  "§": "⁰",
  "¨": "¹",
  "©": "²",
  "ª": "³",      // the *main* race-3 glyph
  "«": "⁴",
  "¬": "⁵",
  "®": "⁷",
  "¯": "⁸",
  "°": "⁹",

  // --------------------------------------------------------
  // ⭐ TINY-A UNDERLINE FIX (DO NOT REMOVE — YOU ARE CORRECT)
  // --------------------------------------------------------
  "a\u0332": "³",
  "\u0332a": "³",
  "\u0061\u0332": "³",
  "\u0332": "",         // remove stray underline
  // --------------------------------------------------------

  // --- Comment quality markers ---
  "ñ": "+",
  "×": "-",

  // --- Fractional lengths (QUARTERS) ---
  "‚": "¼",
  "▯": "½",
  "ƒ": "¾",

  // --- Nose / Head / Neck (tiny digits in raw) ---
  "¹": "ns",
  "²": "hd",
  "³": "nk",

  // --- Track surface (Brisnet turf symbol) ---
  "à": "Ⓣ",

  // --- Age restrictions ---
  "¦": "3↑",
  "¡": "4↑",
};


// ------------------------------------------------------------
// 3️⃣ NUMERIC VALUES FOR LENGTH MATH (no visual output)
// ------------------------------------------------------------
export const GLYPH_MARGINS = {
  "‚": ".25",   // ¼
  "▯": ".5",    // ½
  "ƒ": ".75",   // ¾
  "¹": ".05",   // nose
  "²": ".175",  // head
  "³": ".21",   // neck
};


// ------------------------------------------------------------
// 4️⃣ APPLY GLYPH MAP TO TEXT
// ------------------------------------------------------------
export function applyGlyphMap(text) {
  let out = text;

  for (let key in GLYPHS) {
    if (key === "") continue;   // do not touch invisible tiny-6
    const val = GLYPHS[key];
    out = out.split(key).join(val);
  }

  return out;
}
