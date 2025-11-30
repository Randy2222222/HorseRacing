// STEP 1: Convert Brisnet tiny/staked fractions → ASCII
export function normalizeDistance(d) {
  return d
    // Convert Brisnet fraction slash (U+2044) → regular slash
    .replace(/\u2044/g, "/")

    // Convert different dash-like glyphs → slash (PDF.js might use these)
    .replace(/[\u2012\u2013\u2014\u2015\u2212]/g, "/")

    // Convert vulgar fractions → ASCII
    .replace(/½/g, " 1/2")
    .replace(/¼/g, " 1/4")
    .replace(/¾/g, " 3/4")
    .replace(/⅛/g, " 1/8")
    .replace(/⅜/g, " 3/8")
    .replace(/⅝/g, " 5/8")
    .replace(/⅞/g, " 7/8")
    .replace(/⅙/g, " 1/6")
    .replace(/⅚/g, " 5/6")
    .trim();
}

// STEP 2: Convert ASCII fractions → NICE Unicode fractions for your output
export function toUnicodeFraction(str) {
  return str
    .replace(/1\/2/g, "½")
    .replace(/1\/4/g, "¼")
    .replace(/3\/4/g, "¾")
    .replace(/1\/8/g, "⅛")
    .replace(/3\/8/g, "⅜")
    .replace(/5\/8/g, "⅝")
    .replace(/7\/8/g, "⅞")
    .replace(/1\/6/g, "⅙")
    .replace(/5\/6/g, "⅚")
    .trim();
}
