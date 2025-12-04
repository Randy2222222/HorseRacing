// parsePP.js
// Phase 1 DEV parser — organizes decoded text into clean PP blocks

import { normalizeDistance, toUnicodeFraction } from "./fractions.js";
import { GLYPH_DIGITS } from "./glyphMap.js";

// Make the little numbers for leader times
const SUPERSCRIPTS = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];
function toSuperscript(n) {
  if (n == null) return "";
  const idx = Number(n);
  return Number.isInteger(idx) ? (SUPERSCRIPTS[idx] || "") : "";
}

// ------------------------
// Leader-time helper functions
// ------------------------
function isShortSprint(distanceStr) {
  const d = distanceStr.toLowerCase();
  return (d === "4" || d === "4f" || d === "4½" || d === "4½f");
}

function isTimeLine(line) {
  const t = line.trim();
  return (
    /^:\d{2}$/.test(t) ||      // :22 :45 :57
    /^\d:\d{2}$/.test(t)       // 1:10
  );
}

function isSuperscript(line) {
  const t = line.trim();
  return /^[¹²³⁴]$/.test(t);  // tiny 1–4
}


// 1️⃣ Horse Anchor
const HORSE_ANCHOR =
  /(?:^|\n)(\d{1,2})\s+([A-Za-z0-9'’.\/\- ]+?)\s+\(([A-Z\/]+)\s*\d*\)/g;

// 2️⃣ PP Header Regex (Date + Race Line begins)
const DATE_REGEX = /^\d{2}[A-Za-z]{3}\d{2}/;

// 2️⃣ Distance Patterns
const DISTANCE_REGEX =
  /\b(?:[4-7](?:\s1\/2)?f|1m|2m|1m70|1\s1\/16|1\s1\/8|1\s3\/16|1\s1\/4|1\s3\/8|1\s1\/2|1\s5\/8)\b/i;

// 3️⃣ Surface codes (2-letter)
const SURFACE_CODES = [
  "ft","gd","my","sy","wf","fm","yl","sf","hy","sl"
];

// 4️⃣ Single-letter surface modifiers
const SURFACE_MODIFIERS = ["s", "x", "n", "t", "y"];

// 5️⃣ Surface regex
const SURFACE_REGEX = new RegExp("\\b(" + SURFACE_CODES.join("|") + ")\\b", "i");

// 6️⃣ Leader time fractions (22, 45, 57, 1:10 etc)
const FRACTION_REGEX = /\b(?:\d:)?\d{2}\b/;

// 🔹 Split into horses
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
    const end = (i < horses.length - 1) ? horses[i+1].index : fullText.length;
    horses[i].block = fullText.slice(start, end).trim();
  }

  return horses;
}

// =====================================================
// MAIN PARSER
// =====================================================
export function parsePP(decodedText) {

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

  const horses = splitHorses(decodedText);
  structure.horses = horses;

  const dateRegex = /^\d{2}[A-Za-z]{3}\d{2}/;

  // Parse PP for each horse
  for (const h of horses) {
    const lines = h.block.split("\n").map(l => l.trim());

    let currentPP = [];
    h.pp = [];

    let currentPPdistance = "";
    let currentPPsurface = "";
    let currentPPmodifier = "";
    let currentPPfractions = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1️⃣ DATE = start of new PP block
      if (DATE_REGEX.test(line)) {

        // save previous block
        if (currentPP.length > 0) {
          h.pp.push({
            raw: [...currentPP],
            distance: currentPPdistance,
            surface: currentPPsurface,
            modifier: currentPPmodifier,
            fractions: currentPPfractions
          });
        }

        // reset everything
        currentPP = [];
        currentPPdistance = "";
        currentPPsurface = "";
        currentPPmodifier = "";
        currentPPfractions = [];

        currentPP.push(line);

        // distance
        const distMatch = line.match(DISTANCE_REGEX);
        if (distMatch) {
          currentPPdistance = normalizeDistance(distMatch[0]);
        }

        // surface
        const surfMatch = line.match(SURFACE_REGEX);
        if (surfMatch) {
          currentPPsurface = surfMatch[0].toLowerCase();

          const nextLine = lines[i+1] || "";
          if (nextLine.length === 1 &&
              SURFACE_MODIFIERS.includes(nextLine.toLowerCase())) {
            currentPPmodifier = nextLine.toLowerCase();
            i++; // skip modifier line
          }
        }

        continue; // end of DATE block
      }

      // 2️⃣ LEADER FRACTIONS — tiny digit on next line, then ANY number of blank lines
if (FRACTION_REGEX.test(line)) {

    // Extract the main time
    const times = line.match(/\b(?:\d:)?\d{2}\b/g) || [];

    // Look at next line — tiny number?
    const nextLine = (lines[i + 1] || "").trim();

    if (nextLine.length === 1 && nextLine in GLYPH_DIGITS) {

        const tinyDigit = GLYPH_DIGITS[nextLine];  
        const tinySup   = toSuperscript(tinyDigit);

        if (times.length > 0) {
            times[times.length - 1] += tinySup;
        }

        // Consume the tiny-number row
        i++;

        // 🔹 NOW skip ALL blank/space-only lines (1,2,3 doesn't matter)
        while (true) {
            const peek = (lines[i + 1] || "").trim();
            if (peek === "" || peek === "\u00A0") {
                i++;    // skip it
            } else {
                break;  // stop when a real line appears
            }
        }
    }

    // Save final fractions
    currentPPfractions.push(...times);
    continue;
}

      // 3️⃣ normal lines inside PP block
      if (currentPP.length > 0) {
        currentPP.push(line);
      }
    }

    // final PP block
    if (currentPP.length > 0) {
      h.pp.push({
        raw: [...currentPP],
        distance: currentPPdistance,
        surface: currentPPsurface,
        modifier: currentPPmodifier,
        fractions: currentPPfractions
      });
    }

    structure.ppPerHorse.push({
      post: h.post,
      name: h.name,
      pp: h.pp
    });
  }

  return structure;
}
