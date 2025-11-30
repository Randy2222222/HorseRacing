// parsePP.js
// Phase 1 DEV parser — organizes decoded text into blocks we can inspect
// Turn noarmal fractionns into tiny fractions
import { normalizeDistance, toUnicodeFraction } from "./fractions.js";
// After fractions.js has normalized tiny glyphs:
const DISTANCE_REGEX =
  /\b(?:[4-7](?:\s1\/2)?f|1m|2m|1m70|1\s1\/16|1\s1\/8|1\s3\/16|1\s1\/4|1\s3\/8|1\s1\/2|1\s5\/8)\b/i;
// 2-letter real Brisnet surface conditions
const SURFACE_CODES = [
  "ft", // fast
  "gd", // good
  "my", // muddy
  "sy", // sloppy
  "wf", // wet fast
  "fm", // firm
  "yl", // yielding
  "sf", // soft
  "hy", // heavy
  "sl"  // slow
];

// Single-letter modifiers (superscripts in the PDF)
const SURFACE_MODIFIERS = [
  "s", // sealed
  "x", // drying / variant
  "n", // rail out / inner turf
  "t", // turf variant
  "y"  // yielding superscript
];

// Regex to find the base 2-letter surface condition
const SURFACE_REGEX = new RegExp("\\b(" + SURFACE_CODES.join("|"
// 1️⃣ Horse Anchor
const HORSE_ANCHOR =
  /(?:^|\n)(\d{1,2})\s+([A-Za-z0-9'’.\/\- ]+?)\s+\(([A-Z\/]+)\s*\d*\)/g;

// 2️⃣ Split text into horses
function splitHorses(fullText) {
  const horses = [];
  let m;

  while ((m = HORSE_ANCHOR.exec(fullText)) !== null) {
    horses.push({
      post: m[1],
      name: m[2].trim(),
      style: m[3],
      index: m.index
    });
  }

  for (let i = 0; i < horses.length; i++) {
    const start = horses[i].index;
    const end = (i < horses.length - 1)
      ? horses[i + 1].index
      : fullText.length;
    horses[i].block = fullText.slice(start, end).trim();
  }

  return horses;
}

export function parsePP(decodedText) {

  // 🔵 3️⃣ DEV STRUCTURE AT THE TOP (you were right)
  const lines = decodedText
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const structure = {
    rawLines: lines,
    horses: [],
    ppPerHorse: [],
    unknown: []
  };

  // 🐎 4️⃣ FIRST: detect horses
  const horses = splitHorses(decodedText);
  structure.horses = horses;   // dev panel

  // 🏁 5️⃣ SECOND: detect PP blocks inside each horse
  const dateRegex = /^\d{2}[A-Za-z]{3}\d{2}/;

  for (const h of horses) {
    const lines = h.block.split("\n").map(l => l.trim());

    let currentPP = [];
    h.pp = [];
    let currentPPdistance = "";
    let currentPPsurface = "";
    let currentPPmodifier = "";

    for (let line of lines) {
      if (dateRegex.test(line)) {

  // Save previous PP block
  if (currentPP.length > 0) {
    h.pp.push({
      raw: [...currentPP],
      distance: currentPPdistance || ""
      surface: currentPPsurface || "",
      modifier: currentPPmodifier || ""
    });
  }

  // Reset for new PP block
  currentPP = [];
  currentPPdistance = "";
  currentPP.push(line);

  // --- REAL DISTANCE EXTRACTION USING YOUR REGEX ---
  const distMatch = line.match(DISTANCE_REGEX);
  if (distMatch) {
    currentPPdistance = normalizeDistance(distMatch[0]);
  }
  // --- SURFACE EXTRACTION ---
const surfMatch = line.match(SURFACE_REGEX);
if (surfMatch) {
  currentPPsurface = surfMatch[0].toLowerCase();

  // Look ahead for one-letter modifier on next line
  const nextLine = lines[i + 1]?.trim() || "";
  if (
    nextLine.length === 1 &&
    SURFACE_MODIFIERS.includes(nextLine.toLowerCase())
  ) {
    currentPPmodifier = nextLine.toLowerCase();
    i++; // consume the modifier line
  }
}
  continue;
}

      if (currentPP.length > 0) {
        currentPP.push(line);
      }
    }

    if (currentPP.length > 0) {
      h.pp.push([...currentPP]);
    }

    structure.ppPerHorse.push({
      post: h.post,
      name: h.name,
      pp: h.pp
    });
  }

  return structure;
}
