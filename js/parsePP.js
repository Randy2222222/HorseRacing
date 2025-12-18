// parsePP.js
// Phase 1 DEV parser — organizes decoded text into clean PP blocks

//import { normalizeDistance, toUnicodeFraction } from "./fractions.js";
import { GLYPH_DIGITS } from "./glyphMap.js";
import { GLYPHS } from "./glyphMap.js";
// Make the little numbers for leader times
const SUPERSCRIPTS = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];
function toSuperscript(n) {
  if (n == null) return "";
  const idx = Number(n);
  return Number.isInteger(idx) ? (SUPERSCRIPTS[idx] || "") : "";
}

// 1️⃣ Horse Anchor
const HORSE_ANCHOR = /(?:^|\n)(\d{1,2})\s+([A-Za-z0-9'’.\/\- ]+?)\s+\(([A-Z\/]+)\s*\d*\)/g;

// 2️⃣ PP Header Regex (Date + Race Line begins)
const DATE_REGEX = /^\d{2}[A-Za-z]{3}\d{2}/;

// 3️⃣ Raw Brisnet surface glyphs → your chosen display symbols
const GLYPH_TAGS = ["à", "Ì", "š", "•", "æ"];
const GLYPHS_TO_DISPLAY = ["Ⓣ","Ⓐ","ⓧ","🅃","�"]   

// 4️⃣ Distance Patterns
const DISTANCE_REGEX = /([4-7](?:½)?f?|1m|2m|1m70|1(?:¹⁄₁₆|⅛|³⁄₁₆|¼|⁵⁄₁₆|⅜|½|⅝|¾|))/;

// 5️⃣ Surface codes (2-letter)
//const SURFACE_REGEX = /\b(ft|gd|my|sy|wf|fm|yl|sf|hy|sl)([ˢˣⁿᵗʸ])?\b/i;
//const SURFACE_REGEX = ["ft","gd","my","sy","wf","fm","yl","sf","hy","sl"];
const SURFACE_REGEX = /(ft|gd|my|sy|wf|fm|yl|sf|hy|sl)/;

const SURFACE_TAG_REGEX  =  /(s|x|n|t|y)/i;

const SURFACE_TAG  =  ["s","x","n","t","y"];
//const SURFACE = ["ft","gd","my","sy","wf","fm","yl","sf","hy","sl"];
const SURF_SUPS = ["ˢ","ˣ","ⁿ","ᵗ","ʸ"];

//  6️⃣ Leader-time helper functions
function isShortSprint(distanceStr) {
  const d = distanceStr.toLowerCase();
  return (d === "4" || d === "4f" || d === "4½" || d === "4½f");
}
// (we’re not using UNICODE_SIX here yet, but keeping it in case you
// later want to auto-append a missing ⁶)
const UNICODE_SIX = "\u2076";   // ⁶

// 7️⃣ Line is ONLY 2–3 superscript digits → this IS the RR value
const RR_SUP_LINE_REGEX = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/;

// 8️⃣ RaceType
const RACETTYPE_REGEX = /^\d(Ⓕ|🅂|([A-Za-z]\/+))$/;

// 9️⃣ Class Rating
const CR_SUP_LINE_REGEX = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/;

// 8️⃣ Brisnet speed figures
const E1_REGEX  = /^\d{2,3}$/;      // ex: 76
const E2_REGEX  = /^\d{2,3}\/$/;    // ex: 82/
const LP_REGEX  = /^\d{2,3}$/;      // ex: 86  🔥was LP

// 9️⃣ Race Shapes (1c and 2c): +3, -1, 4, etc.
const SHAPE_REGEX = /^[+-]?\d{1,3}$/;

// 🔟 SPD Speed Rating
const SPD_REGEX = /^\d{2,3}$/;   // matches 84 or 104
const POST_POSITION_REGEX = /^\d{1,2}$/;
const STARTING_GATE_REGEX = /^\d{1,2}$/;
//const STARTING_GATE_LENGTHS_REGEX = /(?:[¹²³⁴⁵⁶⁷⁸⁹]|¹⁰|¹¹|¹²|¹³|¹⁴|¹⁵|¹⁶|¹⁷|¹⁸|¹⁹|²⁰)?(?:¼|½|¾)?/;

const STARTING_GATE_LENGTHS_REGEX = /((?:¼|½|¾|)(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2})(?:¼|½|¾|))/;

const FIRST_CALL_REGEX = /^\d{1,2}$/;

const SECOND_CALL_REGEX = /^\d{1,2}$/;
const STRAIGHT_CAll_REGEX = /^\d{1,2}$/;

const FINISH_REGEX = /^\d{1,2}$/;

// Change SurfTag to Superscript
const SUP_TAG = {
  s: "ˢ",
  x: "ˣ",
  n: "ⁿ",
  t: "ᵗ",
  y: "ʸ"
};
// Superscript SurfTag Helper
function toSupTag(tag) {
  if (!tag) return "";   // null or ""
  return SUP_TAG[tag] ?? tag;
}

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
    let currentPPdate = null;
    let currentPPtrack = null;
    let currentPPraceNo = null;
    let currentPPglyph = null;
    let currentPPdistance = null;
    let currentPPsurface = null;
    let currentPPsurfTag = null;
    let currentPPleaderTimes = null;
    let currentPPraceResult = null;
    let currentPPraceType = null;
    let currentPPclassRating = null;
    let currentPPpace = { e1: null, e2: null, lp: null };
    let currentPPoneC = null;   // race shape 1c
    let currentPPtwoC = null;   // race shape 2c
    let currentPPspd = null;    // 🆕 Brisnet Speed Rating (SPD
    let currentPPpp = null;    // Post Position in Gate
    let currentPPstart = null;  // Horse left Gat in what order( 1st, 4th, 7th, etc.
    let currentPPstlng = null;  // Start Gate Lengths
    let currentPPfirst = null;  // First Call
    let currentPPsecond = null;  // Second Call
    let currnetPPstr = null;     // Straight Call
    let currentPPfinish = null;    // FINISH LINE
    
    let totalCalls = 4;
    let slotIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

  //🛟 SAFETY CATCH 🛟
// --- SAFE DISTANCE DETECT BEFORE CASE BLOCK ---
if (!currentPPdistance && DISTANCE_REGEX.test(line)) {
    currentPPdistance = line.trim();
 }
// 🛟 END SAFETY CATCH 🛟
      
      // 1️⃣ DATE = start of new PP block
      if (DATE_REGEX.test(line)) {

        // 🔒 Save previous block (if any)
        if (currentPP.length > 0) {
          h.pp.push({
            raw: [...currentPP],
            date: currentPPdate,
            track: currentPPtrack,
            race: currentPPraceNo,
            glyph: currentPPglyph,
            distance: currentPPdistance,
            surface: currentPPsurface,
            surfTag: currentPPsurfTag,
            leaderTimes: currentPPleaderTimes,
            rr: currentPPraceResult,
            raceType: currentPPraceType,
            cr: currentPPclassRating,
            pace: currentPPpace,
            oneC: currentPPoneC,
            twoC: currentPPtwoC,
            spd: currentPPspd,
            pp: currentPPpp,
            start: currentPPstart,
            stlng: currentPPstlng,
            first: currentPPfirst,
            second: currentPPsecond,
            straight: currentPPstr,
            finish: currentPPfinish
            
            
          });
        }

        // 🎬 Reset everything
        currentPP = [];
        // ▶️ NEW: extract components from header line
  currentPPdate  = line.slice(0, 7);      // 12Oct25
  currentPPtrack = line.slice(7, 10);     // Kee, CD, GP, SA, etc.
  currentPPraceNo = line.slice(10).trim(); // tiny race number (¹,²,³)
        currentPPglyph = null;
        currentPPdistance = null;
        currentPPsurface = null;
        currentPPsurfTag = null;
        currentPPleaderTimes = {
          leader1:    { raw: null, sup: null },
          leader2:    { raw: null, sup: null },
          leader3:    { raw: null, sup: null },
          leaderFinal:{ raw: null, sup: null }
        };
        currentPPraceResult    = null;
        currentPPraceType      = null;
        currentPPclassRating   = null;
        currentPPpace  = { e1: null, e2: null, lp: null };
        currentPPoneC = null;
        currentPPtwoC = null;
        currentPPspd = null;
        currentPPpp = null;
        currentPPstart = null;
        currentPPstlng = null;
        currentPPfirst = null;
        currentPPsecond = null;
        currentPPstr = null;
        currentPPfinish = null;
        
        // start this PP block with the date line
        currentPP.push(line);


// ------------------------------------------
// ⭐️ Counting Function must keep ⭐️
// ------------------------------------------
   function nextNonBlank(lines, startIndex) {
     let j = startIndex;
     while (j < lines.length && lines[j].trim() === "") j++;
   return j;
  }
//–---–---------------------------------------
// ⭐️ Counting Function must keep ⭐️
//--------------------------------------------
// -----------------------------------------
// STEP — FIND GLYPH + DISTANCE (skip blanks)
// -----------------------------------------

   let j1 = nextNonBlank(lines, i + 1);    // could be glyph or distance
   let L1 = lines[j1] || "";

// CASE 1 — L1 IS A GLYPH (always 1 char)
  // ex: Ⓣ, Ⓐ, ⓧ, 🅃
  if (L1.length === 1 && !/^\d/.test(L1)) {
      currentPPglyph = L1;

    // Next NON-BLANK *must* be distance
      let j2 = nextNonBlank(lines, j1 + 1);
      let L2 = lines[j2] || "";

      if (DISTANCE_REGEX.test(L2)) {
         currentPPdistance = L2;
         i = j2;                    // advance pointer
     } else {
         currentPPdistance = "";    // failed to detect distance
        i = j2;
    }
 }

// CASE 2 — L1 IS ALREADY A DISTANCE
  else if (DISTANCE_REGEX.test(L1)) {
      currentPPglyph = "";
      currentPPdistance = L1;
    i = j1; // consume distance
  }
 //CASE 3 — nothing useful found
     else {
       currentPPglyph = "";
       currentPPdistance = "";
       continue; // end of DATE block
      
        }
   
 
   // ⚡️ RUNNING SURFACE ⚡️
   // const surfaceM = trimmed.match(/(|ft|gd|my|sy|wf|fm|yl|sf|hy|sl|)/i);
     // if (surfaceM) {
    //     currentPPsurface = surfaceM[0];
     //  continue;
  //  }     
      // ⚡️ END OF SURFACE CODE ⚡️


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

      //  RR — Race Rating MUST be 3 superscript digits
      if (currentPPraceResult === null && RR_SUP_LINE_REGEX.test(trimmed)) {
        currentPPraceResult = trimmed;
        continue;
      }

      // ---------------------------------------------
      // RaceType — the line immediately after RR
      // ---------------------------------------------
        const raceTypeM = trimmed.match(
      /\g(Ⓕ|🅂|Alw\d+|A\d+k|G\d|Regret|PuckerUp|QEIICup|DGOaks|PENOaksB|SarOkInv|MsGrillo|Mdn\s+\d+k|OC\d+k)/i
   );
      if (raceTypeM) {
         currentPPraceType = raceTypeM[0];
       continue;
    }     
      


      // CLASS RATING — Must Be 3 superscript digits,
       if (currentPPclassRating === null && CR_SUP_LINE_REGEX.test(trimmed)) {
        currentPPclassRating = trimmed;
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
      // Post Position
      if (currentPPpp === null && POST_POSITION_REGEX.test(trimmed)) {
  currentPPpp = trimmed;
  continue;
}
      // Starting Gate Position
       if (currentPPstart === null && STARTING_GATE_REGEX.test(trimmed)) {
         currentPPstart = trimmed;
        continue;
    }
      // Starting Gates Lengths
    if (currentPPstlng === null && STARTING_GATE_LENTGTHS_REGEX.test(trimmed)) {
         currentPPstlng = trimmed;
    }else{
         currentPPstlng = "";
      continue;
    }
   //   const startLengthM = trimmed.match(/(|¼|½|¾|¹|¹¼|¹½|¹¾|²|²¼|²½|²¾|³¼|³½|³¾|⁴|⁴¼|⁴½|⁴¾|⁵|⁵¼|⁵½|⁵¾|⁶|⁶¼|⁶½|⁶¾|⁷|⁷¼|⁷½|⁷¾|⁸|⁸¼|⁸½|⁸¾|⁹|⁹¼|⁹½|⁹¾|¹⁰|¹⁰¼|¹⁰½|¹⁰¾|)/i);
  
    //  if (startLengthM) {
    //     currentPPstlng = startLengthM[0];
   //    continue;
  //  }    
    // First Call
      if (currentPPfirst === null && FIRST_CALL_REGEX.test(trimmed)) {
           currentPPfirst = trimmed;
          continue;
      }
      // Second Call
    if (currentPPsecond === null && SECOND_CALL_REGEX.test(trimmed)) {
           currentPPsecond = trimmed;
          continue;
      }
      // Straight Call
      if (currentPPstr === null && STRAIGHT_CALL_REGEX.test(trimmed)) {
           currentPPstr = trimmed;
          continue;
      }
      // FINISH
      if (currentPPfinish === null && FINISH_CALL_REGEX.test(trimmed)) {
           currentPPfinish = trimmed;
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
        glyph: currentPPglyph,
        distance: currentPPdistance,
        surface: currentPPsurface,
        surfTag: currentPPsurfTag,
        leaderTimes: currentPPleaderTimes,
        rr: currentPPraceResult,
        raceType: currentPPraceType,
        cr: currentPPclassRating,
        pace: currentPPpace,
        oneC: currentPPoneC,
        twoC: currentPPtwoC,
        spd: currentPPspd,
        pp: currentPPpp,
        start: currentPPstart,
        stlng: currentPPstlng,
        first: currentPPfirst,
        second: currentPPsecond,
        straight: currentPPstr,
        finish: currentPPfinish
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
