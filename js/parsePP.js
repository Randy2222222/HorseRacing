// parsePP.js
// Phase 1 DEV parser — organizes decoded text into clean PP blocks

import { GLYPH_DIGITS } from "./glyphMap.js";

// ----------------- Superscripts -----------------
const SUPERSCRIPTS = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];

function toSuperscript(n) {
  if (n == null) return "";
  const idx = Number(n);
  return Number.isInteger(idx) ? (SUPERSCRIPTS[idx] || "") : "";
}

// ----------------- Regex -----------------
const HORSE_ANCHOR =
  /(?:^|\n)(\d{1,2})\s+([A-Za-z0-9'’.\/\- ]+?)\s+\(([A-Z\/]+)\s*\d*\)/g;

const DATE_REGEX = /^\d{2}[A-Za-z]{3}\d{2}/;

const DISTANCE_REGEX =
  /\b(?:[4-7](?:\s1\/2)?f|1m|2m|1m70|1\s1\/16|1\s1\/8|1\s3\/16|1\s1\/4|1\s3\/8|1\s1\/2|1\s5\/8)\b/i;

const SURFACE_CODES = ["ft","gd","my","sy","wf","fm","yl","sf","hy","sl"];
const SURFACE_MODIFIERS = ["s","x","n","t","y"];
const SURFACE_REGEX = new RegExp("\\b(" + SURFACE_CODES.join("|") + ")\\b", "i");

const RR_SUP_LINE_REGEX = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]{2,3}$/;

const E1_REGEX = /^\d{2}$/;
const E2_REGEX = /^\d{2}\/$/;
const LP_REGEX = /^\d{2}$/;

// ----------------- Helpers -----------------
function isTimeLine(line) {
  const t = line.trim();
  return (
    /^:\d{2}$/.test(t) ||
    /^\d:\d{2}$/.test(t)
  );
}

function isSuperscript(line) {
  return /^[¹²³⁴]$/.test(line.trim());
}

function isShortSprint(distanceStr) {
  const d = distanceStr.toLowerCase();
  return (d === "4" || d === "4f" || d === "4½" || d === "4½f");
}

// ----------------- Split Horses -----------------
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
    const end = (i < horses.length - 1 ? horses[i+1].index : fullText.length);
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

  const horses = splitHorses(decodedText);

  const structure = {
    rawLines: lines,
    horses,
    ppPerHorse: [],
    unknown: []
  };

  for (const h of horses) {
    const lines = h.block.split("\n").map(l => l.trim());

    let currentPP = [];

    let currentPPdistance = "";
    let currentPPsurface = "";
    let currentPPmodifier = "";

    let currentPPleaderTimes = null;
    let currentPPraceResult = null;
    let currentPPraceType = "";
    let expectRaceTypeNext = false;

    let currentPPclassRating = null;
    let expectClassRatingNext = false;

    let currentPPpace = { e1: null, e2: null, lp: null };

    let totalCalls = 4;
    let slotIndex = 0;

    h.pp = [];

    // ------------------------- loop lines -------------------------
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // --------------------- DATE = new PP block ---------------------
      if (DATE_REGEX.test(line)) {

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

        // RESET BLOCK
        currentPP = [];
        currentPPdistance = "";
        currentPPsurface = "";
        currentPPmodifier = "";

        currentPPleaderTimes = {
          leader1: { raw: null, sup: null },
          leader2: { raw: null, sup: null },
          leader3: { raw: null, sup: null },
          leaderFinal: { raw: null, sup: null }
        };

        currentPPraceResult = null;
        currentPPraceType = "";
        expectRaceTypeNext = false;

        currentPPclassRating = null;
        expectClassRatingNext = false;

        currentPPpace = { e1: null, e2: null, lp: null };

        // distance
        currentPP.push(line);

        const distMatch = line.match(DISTANCE_REGEX);
        if (distMatch) currentPPdistance = distMatch[0];

        const surfMatch = line.match(SURFACE_REGEX);
        if (surfMatch) {
          currentPPsurface = surfMatch[0].toLowerCase();

          const nextLine = lines[i+1] || "";
          if (nextLine.length === 1 && SURFACE_MODIFIERS.includes(nextLine.toLowerCase())) {
            currentPPmodifier = nextLine.toLowerCase();
            i++;
          }
        }

        totalCalls = isShortSprint(currentPPdistance) ? 3 : 4;
        slotIndex = 0;

        continue;
      }

      // --------------------- Leader Times ---------------------
      if (isTimeLine(trimmed)) {
        if (slotIndex === 0 && totalCalls === 3) {
          slotIndex++; // skip leader1
        }

        let raw = trimmed;
        let sup = null;

        if (i + 1 < lines.length && isSuperscript(lines[i+1])) {
          sup = lines[i+1].trim();
          i++;
        }

        if (slotIndex === 0) currentPPleaderTimes.leader1 = { raw, sup };
        else if (slotIndex === 1) currentPPleaderTimes.leader2 = { raw, sup };
        else if (slotIndex === 2) currentPPleaderTimes.leader3 = { raw, sup };
        else currentPPleaderTimes.leaderFinal = { raw, sup };

        slotIndex++;
        continue;
      }

      // --------------------- RR --------------------------------
      if (RR_SUP_LINE_REGEX.test(trimmed)) {
        currentPPraceResult = trimmed;
        expectRaceTypeNext = true;
        continue;
      }

      // --------------------- RACE TYPE -------------------------
      if (expectRaceTypeNext) {
        if (trimmed.length === 0) continue;

        currentPPraceType = trimmed;
        expectRaceTypeNext = false;
        expectClassRatingNext = true;
        continue;
      }

      // --------------------- CLASS RATING ----------------------
      if (expectClassRatingNext) {
        if (trimmed.length === 0) continue;

        if (RR_SUP_LINE_REGEX.test(trimmed)) {
          currentPPclassRating = trimmed;
        }
        expectClassRatingNext = false;
        continue;
      }

      // --------------------- PACE ------------------------------
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

      // --------------------- normal line -----------------------
      currentPP.push(line);
    }

    // --------------------- final block -------------------------
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
