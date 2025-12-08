
// pdfReader.js
// Clean, simple PDF loader with DEV MODE output
import { parsePP } from "./parsePP.js";
import { applyGlyphMap } from "./glyphMap.js";

const DEV_MODE = "decoded";  // turn off later when finished

function updateStatus(msg) {
  document.getElementById("pdfStatus").textContent = msg;
}

// Load PDF and return full extracted text
export async function loadPDF(file) {
  const pdf = await pdfjsLib.getDocument({ url: URL.createObjectURL(file) }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join("\n") + "\n";
  }
  return fullText;
}

// Main reader function your button will call
export async function readPDFAndDecode(file) {
  const rawText = await loadPDF(file);

  // DEV MODE: show raw text panel
  if (DEV_MODE === "raw") {
    const rawOut = document.getElementById("devRawOutput");
    if (rawOut) rawOut.textContent = rawText;
  }

  // Remove stray UTF-8 junk (Â)
  let cleanText = rawText.replace(/Â/g, "");
   // ⭐⭐ INSERT THIS BLOCK RIGHT HERE ⭐⭐
  // Decode ns / hd / nk BEFORE glyphMap introduces fractions
  cleanText = cleanText
    .replace(/¹/g, "ⁿˢ")
    .replace(/²/g, "ʰᵈ")
    .replace(/³/g, "ⁿᵏ");
  // ⭐⭐ END INSERT ⭐⭐

  // DEV MODE: show cleaned text
  if (DEV_MODE === "clean") {
    const cleanOut = document.getElementById("devCleanOutput");
    if (cleanOut) cleanOut.textContent = cleanText;
  }

  // Decode Brisnet symbols
  const decodedText = applyGlyphMap(cleanText);

  // DEV MODE: show decoded text panel
  if (DEV_MODE === "decoded") {
    const decodedOut = document.getElementById("devDecodedOutput");
   if (decodedOut) decodedOut.textContent = decodedText;
 }

 // return decodedText;   // parser will use this next
//}
// ===============================
// 🔥 STRUCTURED PARSE OUTPUT
// ===============================
if (DEV_MODE === "structured") {
  const parsed = parsePP(decodedText);

  let out = "=========== PARSED STRUCTURE ===========\n\n";

  for (const h of parsed.horses) {
    out += `HORSE ${h.post || "?"} — ${h.name || "UNKNOWN"}\n`;

    h.pp.forEach((pp) => {
     // out += `   Date: ${pp.date} ${pp.track} ${pp.race}\n`;
      out += `   ${pp.date}${pp.track}${pp.race}\n`;
    
      //   out += `    Date: ${pp.date}\n`;
    //  out += `    Track: ${pp.track}\n`;
     // out += `    Race#: ${pp.race}\n`;
      out += `    Distance: ${pp.distance}\n`;
      out += `    Surface: ${pp.surface} (${pp.modifier || ""})\n`;
      out += `    Condition: ${pp.condition}${pp.conditionSup || ""}\n`;

      out += `    Leader Times:\n`;
      out += `        1c: ${pp.leaderTimes.leader1.raw || ""} ${pp.leaderTimes.leader1.sup || ""}\n`;
      out += `        2c: ${pp.leaderTimes.leader2.raw || ""} ${pp.leaderTimes.leader2.sup || ""}\n`;
      out += `        3c: ${pp.leaderTimes.leader3.raw || ""} ${pp.leaderTimes.leader3.sup || ""}\n`;
      out += `     Final: ${pp.leaderTimes.leaderFinal.raw || ""} ${pp.leaderTimes.leaderFinal.sup || ""}\n`;

      out += `    RR: ${pp.rr}\n`;
      out += `    Race Type: ${pp.raceType}\n`;
      out += `    Class Rating: ${pp.classRating}\n`;

     // out += `    Pace:\n`;
      out += `        E1: ${pp.pace.e1}\n`;
      out += `        E2: ${pp.pace.e2}\n`;
      out += `        LP: ${pp.pace.lp}\n`;

      out += `    1c Shape: ${pp.oneC}\n`;
      out += `    2c Shape: ${pp.twoC}\n`;
      out += `    SPD: ${pp.spd}\n\n`;
    });

    out += "========================================\n\n";
  }

  const structuredOut = document.getElementById("devStructuredOutput");
  if (structuredOut) structuredOut.textContent = out;

  return decodedText;
}
  return decodedText;
}
