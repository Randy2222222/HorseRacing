// bugs🪲

// Parsed but bugs 🪲


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
//const GLYPH_TAGS = ["à", "Ì", "š", "•", "æ"];
const GLYPHS_TO_DISPLAY = ["Ⓣ","Ⓐ","ⓧ","🅃","�"]   

// 4️⃣ Distance Patterns
const DISTANCE_REGEX = /([4-7](?:½)?f?|1m|2m|1m70|1(?:¹⁄₁₆|⅛|³⁄₁₆|¼|⁵⁄₁₆|⅜|½|⅝|¾|))/;

// 5️⃣ Surface codes (2-letter)
const SURFACE_REGEX = /^(ft|gd|my|sy|wf|fm|yl|sf|hy|sl)$/i;
const SURFACE_TAG_REGEX = /(ˢ|ˣ|ⁿ|ᵗ|ʸ)/;

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
//const RACETTYPE_REGEX = /^\d(Ⓕ|🅂|([A-Za-z]\/+))$/;
const RACETYPE_REGEX = /(?:🅂,Ⓕ)([A-Za-z]{2,})(\d{1,3}[kK]?)?(\/[n\dLx\-]+)?(?:-([A-Za-z\d]+))?(?:\s+([A-Za-z]+\d+[kK]?))/;

// 9️⃣ Class Rating
const CR_SUP_LINE_REGEX = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/;

// 8️⃣ Brisnet speed figures
const E1_REGEX = /^\d{2,3}$/;      // ex: 76
const E2_REGEX = /^\d{2,3}\/$/;    // ex: 82/
const LP_REGEX = /^\d{2,3}$/;      // ex: 86  🔥was LP

// 9️⃣ Race Shapes (1c and 2c): +3, -1, 4, etc.
const SHAPE_REGEX = /^[+-]?\d{1,3}$/;

// 🔟 SPD Speed Rating
const SPD_REGEX = /^\d{2,3}$/;   // matches 84 or 104
const POST_POSITION_REGEX = /^\d{1,2}$/;
const STARTING_GATE_REGEX = /^\d{1,2}$/;
const STARTING_GATE_LG_REGEX = /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}(?:¼|½|¾|)?|ⁿˢ|ʰᵈ|ⁿᵏ|¼|½|¾)$/;
//const FIRST_LG_REGEX = /[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}/;
//const FIRST_LG_REGEX = /((?:¼|½|¾|)(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2})(?:¼|½|¾|))/;

//const STARTING_GATE_LENGTHS_REGEX = /[\s\u00A0]*[⁰¹²³⁴⁵⁶⁷⁸⁹](?:¼|½|¾)?/;
const FIRST_CALL_REGEX = /^\d{1,2}$/;
const FIRST_LG_REGEX = /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}(?:¼|½|¾|)?|ⁿˢ|ʰᵈ|ⁿᵏ|¼|½|¾)$/;
const SECOND_CALL_REGEX = /^\d{1,2}$/;
const SECOND_LG_REGEX = /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}(?:¼|½|¾|)?|ⁿˢ|ʰᵈ|ⁿᵏ|¼|½|¾)$/;
const STRAIGHT_CALL_REGEX = /^\d{1,2}$/;
const STRAIGHT_LG_REGEX = /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}(?:¼|½|¾|)?|ⁿˢ|ʰᵈ|ⁿᵏ|¼|½|¾)$/;
const FINISH_REGEX = /^\d{1,2}$/;
const FINISH_LG_REGEX = /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}(?:¼|½|¾|)?|ⁿˢ|ʰᵈ|ⁿᵏ|¼|½|¾)$/;
const JOCKEY_REGEX = /^[A-Z][a-z]+[A-Z]{1,2}[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/;
const EQUIPMENT_REGEX = /^(Lb|L|b)$/;
const ODDS_REGEX = /^\d{1,2}\.\d{1,2}$/;
const WIN_REGEX = /^[A-Za-z ]+$/;
const WIN_LG_REGEX = /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}(?:¼|½|¾|)?|ⁿˢ|ʰᵈ|ⁿᵏ|¼|½|¾)$/;
const PLACE_REGEX = /^[A-Za-z ]+$/;
const PLACE_LG_REGEX = /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}(?:¼|½|¾|)?|ⁿˢ|ʰᵈ|ⁿᵏ|¼|½|¾)$/;
const SHOW_REGEX = /^[A-Za-z ]+$/;
const SHOW_LG_REGEX = /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2}(?:¼|½|¾|)?|ⁿˢ|ʰᵈ|ⁿᵏ|¼|½|¾)$/;
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
    let currentPPsurface = { sf: null, tg: null }
    let currentPPleaderTimes = null;
    let currentPPraceResult = null;
    let currentPPraceType = null;
    let currentPPclassRating = null;
    let currentPPpace = { e1: null, e2: null, lp: null };
    let currentPPoneC = null;   // race shape 1c
    let currentPPtwoC = null;   // race shape 2c
    let currentPPspd = null;    // 🆕 Brisnet Speed Rating (SPD
    let currentPPpp = null;    // Post Position in Gate
    let currentPPgate = { gc: null, lg: null }; // Horse left Gate in what order( 1st, 4th, 7th, etc.
    let currentPPfirst = { c1: null, lg: null }; // First Call
    let currentPPsecond = { c2: null, lg: null }; // Second Call
    let currentPPstraight = { str: null, lg: null };// Straight Call
    let currentPPfinish = { fin: null, lg: null };  // FINISH
    let currentPPjockey = null;
    let currentPPequipment = null;
    let currentPPodds = null;
    let currentPPwin = { wn: null, lg: null };
    let currentPPplace = { pl: null, lg: null };
    let currentPPshow = { sh: null, lg: null };
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
            leaderTimes: currentPPleaderTimes,
            rr: currentPPraceResult,
            raceType: currentPPraceType,
            cr: currentPPclassRating,
            pace: currentPPpace,
            oneC: currentPPoneC,
            twoC: currentPPtwoC,
            spd: currentPPspd,
            pp: currentPPpp,
            gate: currentPPgate,
            first: currentPPfirst,
            second: currentPPsecond,
            straight: currentPPstraight,
            finish: currentPPfinish,
            jockey: currentPPjockey,
            equipment: currentPPequipment,
            odds: currentPPodds,
            win: currentPPwin,
            place: currentPPplace,
            show: currentPPshow
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
        currentPPsurface = { sf: null, tg: null };
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
        currentPPgate = { gc: null, lg: null };
        currentPPfirst = { c1: null, lg: null };
        currentPPsecond = { c2: null, lg: null };
        currentPPstraight = { str: null, lg: null };
        currentPPfinish = { fin: null, lg: null };
        currentPPjockey = null;
        currentPPequipment = null;
        currentPPodds = null;
        currentPPwin = { wn: null, lg: null };
        currentPPplace = { pl: null, lg: null };
        currentPPshow = { sh: null, lg: null };
      
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
         continue; 
      
       }


        // ⚡️ RUNNING SURFACE ⚡️
// ---- SURFACE + SURFACE TAG ----
if (currentPPsurface.sf === null) {

  const jSurface = nextNonBlank(lines, i + 1);
  const surfaceLine = (lines[jSurface] || "").trim();

  if (SURFACE_REGEX.test(surfaceLine)) {
    currentPPsurface.sf = surfaceLine;

    // SurfaceTag is the *physical* next line after surface
    const tagLine = (lines[jSurface + 1] || "").trim();

    if (currentPPsurface.tg === null && SURFACE_TAG_REGEX.test(tagLine)) {
      currentPPsurface.tg = tagLine;
      i = jSurface + 1; // consume surface + tag
    } else {
      currentPPsurface.tg = "";
      i = jSurface; // consume surface only
    }

    continue;
  }
}
       // ⚡️ END OF SURFACE CODE ⚡️
        // 🏄‍♀️ Surface Tag 🏄‍♀️
  
       // 🏄‍♀️ Surface Tag End 🏄‍♀️
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

      // RaceType — Description of Race and Name
           const raceTypeM = trimmed.match(
           /(Ⓕ|🅂|Alw\d+|A\d+k|G\d|Regret|PuckerUp|QEIICup|DGOaks|PENOaksB|SarOkInv|MsGrillo|Mdn\s+\d+k|OC\d+k)/g
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
       if (currentPPgate.gc === null && STARTING_GATE_REGEX.test(trimmed)) {
  currentPPgate.gc = trimmed;
        continue;
}
      if (currentPPgate.lg === null && STARTING_GATE_LG_REGEX.test(trimmed)) {
  currentPPgate.lg = trimmed;   
        continue;
      }
      // First Call
      if (currentPPfirst.c1 === null && FIRST_CALL_REGEX.test(trimmed)) {
  currentPPfirst.c1 = trimmed;
        continue;
}
      if (currentPPfirst.lg === null && FIRST_LG_REGEX.test(trimmed)) {
  currentPPfirst.lg = trimmed;
        continue;
      }
      // Second Call
      if (currentPPsecond.c2 === null && SECOND_CALL_REGEX.test(trimmed)) {
  currentPPsecond.c2 = trimmed;
        continue;
}
      if (currentPPsecond.lg === null && SECOND_LG_REGEX.test(trimmed)) {
 currentPPsecond.lg = trimmed;
        continue;
      }
      // Straight Call
      if (currentPPstraight.str === null && STRAIGHT_CALL_REGEX.test(trimmed)) {
     currentPPstraight.str = trimmed;
        continue;
}
      if (currentPPstraight.lg === null && STRAIGHT_LG_REGEX.test(trimmed)) {
        currentPPstraight.lg = trimmed;
        continue;
      }
      // FINISH
      if (currentPPfinish.fin === null && FINISH_REGEX.test(trimmed)) {
  currentPPfinish.fin = trimmed;
        continue;
}
      if (currentPPfinish.lg === null && FINISH_LG_REGEX.test(trimmed)) {
        currentPPfinish.lg = trimmed;
        continue;
      }
      // 🏇Jockey and Weight
      if (currentPPjockey === null && JOCKEY_REGEX.test(trimmed)) {
        currentPPjockey = trimmed;
        continue;
      }
      // Equipment
      if (currentPPequipment === null && EQUIPMENT_REGEX.test(trimmed)) {
        currentPPequipment = trimmed;
        continue;
      }
      // Odds
      if (currentPPodds === null && ODDS_REGEX.test(trimmed)) {
        currentPPodds = trimmed;
        continue;
      }
      // Winners Horse name and lengths in front of Place Horse
      if (currentPPwin.wn === null && WIN_REGEX.test(trimmed)) {
  currentPPwin.wn = trimmed;
        continue;
}
      if (currentPPwin.lg === null && WIN_LG_REGEX.test(trimmed)) {
  currentPPwin.lg = trimmed;   
        continue;
      }
      // Place Horse and lengths behind Winner
      if (currentPPplace.pl === null && PLACE_REGEX.test(trimmed)) {
  currentPPplace.pl = trimmed;
        continue;
}
      if (currentPPplace.lg === null && PLACE_LG_REGEX.test(trimmed)) {
  currentPPplace.lg = trimmed;   
        continue;
      }
      // Show Horse Name and lengths behind Place Horse
      if (currentPPshow.sh === null && SHOW_REGEX.test(trimmed)) {
  currentPPshow.sh = trimmed;
        continue;
}
      if (currentPPshow.lg === null && SHOW_LG_REGEX.test(trimmed)) {
  currentPPshow.lg = trimmed;   
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
        leaderTimes: currentPPleaderTimes,
        rr: currentPPraceResult,
        raceType: currentPPraceType,
        cr: currentPPclassRating,
        pace: currentPPpace,
        oneC: currentPPoneC,
        twoC: currentPPtwoC,
        spd: currentPPspd,
        pp: currentPPpp,
        gate: currentPPgate,
        first: currentPPfirst,
        second: currentPPsecond,
        straight: currentPPstraight,
        finish: currentPPfinish,
        jockey: currentPPjockey,
        equipment: currentPPequipment,
        odds: currentPPodds,
        win: currentPPwin,
        place: currentPPplace,
        show: currentPPshow
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
