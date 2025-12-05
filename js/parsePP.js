// parsePP.js
// Phase 1 DEV parser — organizes decoded text into clean PP blocks

//import { normalizeDistance, toUnicodeFraction } from "./fractions.js";
import { GLYPH_DIGITS } from "./glyphMap.js";

// Make the little numbers for leader times
const SUPERSCRIPTS = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];
function toSuperscript(n) {
  if (n == null) return "";
  const idx = Number(n);
  return Number.isInteger(idx) ? (SUPERSCRIPTS[idx] || "") : "";
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
  "ft","gd","my","sy","wf","fm","yl","sf","hy","sl"];

// 4️⃣ Single-letter surface modifiers
const SURFACE_MODIFIERS = ["s", "x", "n", "t", "y"];

// 5️⃣ Surface regex
const SURFACE_REGEX = new RegExp("\\b(" + SURFACE_CODES.join("|") + ")\\b", "i");   

// ------------------------
//  6️⃣ Leader-time helper functions
// ------------------------
function isShortSprint(distanceStr) {
  const d = distanceStr.toLowerCase();
  return (d === "4" || d === "4f" || d === "4½" || d === "4½f");
}

//-------------------------
// 7️⃣ RR Regex
//-------------------------
const UNICODE_SIX = "\u2076";   // ⁶
// Line is ONLY 2–3 superscript digits → this IS the RR value
const RR_SUP_LINE_REGEX = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/;
//--------------------------
// 8️⃣ Brisnet speed figures
//-----------------–--------
const E1_REGEX  = /^\d{2}$/;      // ex: 76
const E2_REGEX  = /^\d{2}\/$/;    // ex: 82/
const LP_REGEX  = /^\d{2}$/;      // ex: 86

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
    let currentPPleaderTimes = null;
    let currentPPraceResult = null;
    let currentPPclassRating = null;
    let expectClassRatingNext = false;

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
            leaderTimes: currentPPleaderTimes,
            rr: currentPPraceResult,
            classRating: currentPPclassRating
          });
        }

        // reset everything
        currentPP = [];
        currentPPdistance = "";
        currentPPsurface = "";
        currentPPmodifier = "";
       
        currentPPleaderTimes = {
              leader1:    { raw: null, sup: null },
              leader2:    { raw: null, sup: null },
              leader3:    { raw: null, sup: null },
              leaderFinal:{ raw: null, sup: null }
};
              currentPPraceResult = null;
              currentPPraceResult = null;
              currentPPraceType   = "";
              expectRaceTypeNext  = false;

              currentPPclassRating = null;
              expectClassRatingNext = false;
              currentPPpace = {
            e1: null,
            e2: null,
            lp: null
          };
      
        //end of reset block
        currentPP.push(line);

        // distance
        const distMatch = line.match(DISTANCE_REGEX);
        if (distMatch) {
        currentPPdistance = distMatch[0];   // glyphMap already made it pretty changed one word / normalizeDistance(distMatch[0]);
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


let totalCalls = isShortSprint(currentPPdistance) ? 3 : 4;
let slotIndex = 0;
        
        continue; // end of DATE block
      }

      // -----------------------------
// 2️⃣ Leader Times (calls)
// -----------------------------
const trimmed = line.trim();

if (isTimeLine(trimmed)) {

  // handle short sprints (missing leader1)
  if (slotIndex === 0 && totalCalls === 3) {
    slotIndex++; // skip leader1
  }

  let raw = trimmed;
  let sup = null;

  // look for superscript on next line
  if (i + 1 < lines.length && isSuperscript(lines[i + 1])) {
    sup = lines[i + 1].trim();
    i++; // skip the superscript line
  }

  // store the call in the right slot
  if (slotIndex === 0) {
    currentPPleaderTimes.leader1 = { raw, sup };
  } else if (slotIndex === 1) {
    currentPPleaderTimes.leader2 = { raw, sup };
  } else if (slotIndex === 2) {
    currentPPleaderTimes.leader3 = { raw, sup };
  } else {
    currentPPleaderTimes.leaderFinal = { raw, sup };
  }

  slotIndex++;
}
  
// ----------------------------------------------------
//  RR — Race Rating (always on its own line AFTER calls)
//  MUST be 2–3 superscript digits ONLY.
// ----------------------------------------------------
if (/^[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/.test(trimmed)) {

  // Store RR exactly as printed in the PDF
  currentPPraceResult = trimmed;

  continue;   // IMPORTANT — stop processing this line
}
      
      // ---------------------------------------------
// RaceType — the line immediately after RR
// ---------------------------------------------
if (expectRaceTypeNext) {

    if (trimmed.length === 0) {
        // Skip blank lines but stay in RaceType mode
        continue;
    }

    // This line IS the RaceType line
    currentPPraceType = trimmed;

    // After we read RaceType, the NEXT superscript line is Class Rating
    expectRaceTypeNext = false;
    expectClassRatingNext = true;

    continue;
}
// ----------------------------------------------------
//  CLASS RATING — superscript digits on the next line
//  after RaceType. Example: ¹¹⁴
// ----------------------------------------------------
if (expectClassRatingNext) {

  if (trimmed.length === 0) {
    // skip blank lines but keep expecting
    continue;
  }

  // must be only superscript digits
  if (/^[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/.test(trimmed)) {
    currentPPclassRating = trimmed;
  }

  expectClassRatingNext = false;
  continue;
}
      // 🟦 PACE: E1, E2/, LP  ------------------------
    if (currentPPpace.e1 === null && E1_REGEX.test(trimmed)) {
      currentPPpace.e1 = trimmed;
    continue;
 }

    if (currentPPpace.e2 === null && E2_REGEX.test(trimmed)) {
     currentPPpace.e2 = trimmed;
   continue;
 }

    if (currentPPpace.lp === null && LP_REGEX.test(trimmed)) {
     currentPPpace.lp = trimmed;
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
        leaderTimes: currentPPleaderTimes,
        rr: currentPPraceResult,
        raceType: currentPPraceType,
        classRating: currentPPclassRating,
        pace: currentPPpace
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
