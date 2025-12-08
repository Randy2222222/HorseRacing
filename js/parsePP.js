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

//const SURFACE_GLYPHS = ["à", "Ì", "š", "•", "æ"];
// Raw Brisnet surface glyphs → your chosen display symbols
//const SURFACE_LOOKUP = {
//  "à": "Ⓣ",   // turf
 // "Ì": "Ⓐ",   // all-weather / synthetic
 // "š": "ⓧ",   // taken off turf
 // "•": "ⓓ",   // dirt / inner dirt
 // "æ": "�"    // unknown
//};
// 2️⃣ Distance Patterns
const DISTANCE_REGEX =
  /\b([4-7](?:¹⁄₂)?f?|1m|2m|1m70|1(?:¹⁄₁₆|¹⁄₈|³⁄₁₆|¹⁄₄|³⁄₈|¹⁄₂|⁵⁄₈))\b/;

// 3️⃣ Surface codes (2-letter)
const SURFACE_REGEX = [
  "ft","gd","my","sy","wf","fm","yl","sf","hy","sl"
];

// 4️⃣ Single-letter surface modifiers
const SURFACE_MODIFIERS = ["ˢ", "ˣ", "ⁿ", "ᵗ", "ʸ"];

// 5️⃣ Surface regex
//const SURFACE_REGEX = new RegExp("\\b(" + SURFACE_MODIFIERS.join("|") + ")\\b", "i");

//  6️⃣ Leader-time helper functions
function isShortSprint(distanceStr) {
  const d = distanceStr.toLowerCase();
  return (d === "4" || d === "4f" || d === "4½" || d === "4½f");
}

// 7️⃣ RR Regex
// (we’re not using UNICODE_SIX here yet, but keeping it in case you
// later want to auto-append a missing ⁶)
const UNICODE_SIX = "\u2076";   // ⁶
// Line is ONLY 2–3 superscript digits → this IS the RR value
const RR_SUP_LINE_REGEX = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/;

// 8️⃣ Brisnet speed figures
const E1_REGEX  = /^\d{2,3}$/;      // ex: 76
const E2_REGEX  = /^\d{2,3}\/$/;    // ex: 82/
const LP_REGEX  = /^\d{2,3}$/;      // ex: 86  🔥was LP

// 9️⃣ Race Shapes (1c and 2c): +3, -1, 4, etc.
const SHAPE_REGEX = /^[+\-]?\d{1,3}$/;

// 🔟 SPD Speed Rating
const SPD_REGEX = /^\d{2,3}$/;   // matches 84 or 104

// Regex helpers
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

  // 🏇 Parse PP for each Horse
  for (const h of horses) {
    const lines = h.block.split("\n").map(l => l.trim());

    let currentPP = [];
    h.pp = [];
    let currentPPdate = "";
    let currentPPtrack = "";
    let currentPPraceNo = "";
    let currentPPdistance = "";
    let currentPPsurface = "";
   // let currentPPmodifier = "";
   // let currentPPconditionSup = "";
    let currentPPleaderTimes = null;
    let currentPPraceResult = null;
    let currentPPclassRating = null;
    let expectClassRatingNext = false;
    let currentPPraceType = "";
    let expectRaceTypeNext = false;
    let currentPPpace = { e1: null, e2: null, lp: null };
    let currentPPoneC = null;   // race shape 1c
    let currentPPtwoC = null;   // race shape 2c
    let currentPPspd = null;   // 🆕 Brisnet Speed Rating (SPD)
    
    let totalCalls = 4;
    let slotIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1️⃣ DATE = start of new PP block
      if (DATE_REGEX.test(line)) {

        // 🔒 Save previous block (if any)
        if (currentPP.length > 0) {
          h.pp.push({
            raw: [...currentPP],
            date: currentPPdate,
            track: currentPPtrack,
            race: currentPPraceNo,
            distance: currentPPdistance,
            surface: currentPPsurface,
           // modifier: currentPPmodifier,
          //  conditionSup: currentPPconditionSup,
            leaderTimes: currentPPleaderTimes,
            rr: currentPPraceResult,
            raceType: currentPPraceType,
            classRating: currentPPclassRating,
            pace: currentPPpace,
            oneC: currentPPoneC,
            twoC: currentPPtwoC,
            spd: currentPPspd
          });
        }

        // 🎬 Reset everything
        currentPP = [];
        // ▶️ NEW: extract components from header line
  currentPPdate  = line.slice(0, 7);      // 12Oct25
  currentPPtrack = line.slice(7, 10);     // Kee, CD, GP, SA, etc.
  currentPPraceNo = line.slice(10).trim(); // tiny race number (¹,²,³)
        currentPPdistance = "";
        currentPPsurface = "";
      //  currentPPmodifier = "";
      //  currentPPconditionSup = "";
        currentPPleaderTimes = {
          leader1:    { raw: null, sup: null },
          leader2:    { raw: null, sup: null },
          leader3:    { raw: null, sup: null },
          leaderFinal:{ raw: null, sup: null }
        };

        currentPPraceResult    = null;
        currentPPraceType      = "";
        expectRaceTypeNext     = false;
        currentPPclassRating   = null;
        expectClassRatingNext  = false;
        currentPPpace          = { e1: null, e2: null, lp: null };
        currentPPoneC = null;
        currentPPtwoC = null;
        currentPPspd = null;
        
        // start this PP block with the date line
        currentPP.push(line);

// --------------------------------------------------
// STEP 2 — FIND DISTANCE (ignore the glyph completely)
// --------------------------------------------------

let L1 = (lines[i + 1] || "").trim();  // could be distance OR glyph
let L2 = (lines[i + 2] || "").trim();  // used only if L1 is a glyph

// CASE 1 — L1 is a distance
if (DISTANCE_REGEX.test(L1)) {
    currentPPdistance = L1;
    currentGlyph      = "";   // ignore glyphs, not looking for them here
    i += 1;
}

// CASE 2 — L1 is ONE CHARACTER (glyph) AND L2 is a distance
else if (L1.length === 1 && !/^\d/.test(L1) && DISTANCE_REGEX.test(L2)) {
    currentPPdistance = L2;
    currentGlyph      = L1;   // save it separately ONLY IF YOU WANT IT
    i += 2;
}

// CASE 3 — nothing matches → leave it blank
else {
    currentPPdistance = "";
    currentGlyph      = "";
}


// ---------------------------
// CALL COUNT (3 for sprints)
// ---------------------------
totalCalls = isShortSprint(currentPPdistance) ? 3 : 4;
slotIndex = 0;

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
        continue;
      }

      // ----------------------------------------------------
      //  RR — Race Rating (always on its own line AFTER calls)
      //  MUST be 2–3 superscript digits ONLY.
      // ----------------------------------------------------
      if (RR_SUP_LINE_REGEX.test(trimmed)) {
        currentPPraceResult = trimmed;
        expectRaceTypeNext = true;  // next non-blank line is RaceType
        continue;
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
        if (RR_SUP_LINE_REGEX.test(trimmed)) {
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
  
      // 🟥 Race Shapes: 1c and 2c (after LP) 
    // Only start looking for shapes AFTER we have LP
    if (currentPPpace.lp !== null && SHAPE_REGEX.test(trimmed)) {

      // First such line after LP = 1c
      if (currentPPoneC === null) {
        currentPPoneC = trimmed;
        continue;
      }

      // Second such line after LP = 2c
      if (currentPPtwoC === null) {
        currentPPtwoC = trimmed;
        continue;
      }
      // If both set, fall through and treat any later numbers as normal
    }
      // SPD — Bris Speed Rating (2 or 3 digit number)
if (currentPPspd === null && SPD_REGEX.test(trimmed)) {
  currentPPspd = trimmed;
  continue;
}
      
      // 3️⃣ normal lines inside PP block
      if (currentPP.length > 0) {
        currentPP.push(line);
      }
    }

    // 🏁 Final PP block
    if (currentPP.length > 0) {
      h.pp.push({
        raw: [...currentPP],
        date: currentPPdate,
        track: currentPPtrack,
        race: currentPPraceNo,
        distance: currentPPdistance,
        surface: currentPPsurface,
       // modifier: currentPPmodifier,
       // conditionSup: currentPPconditionSup,
        leaderTimes: currentPPleaderTimes,
        rr: currentPPraceResult,
        raceType: currentPPraceType,
        classRating: currentPPclassRating,
        pace: currentPPpace,
        oneC: currentPPoneC,
        twoC: currentPPtwoC,
        spd: currentPPspd
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
