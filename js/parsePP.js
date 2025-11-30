// parsePP.js
// Phase 1 DEV parser — organizes decoded text into blocks we can inspect

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

    for (let line of lines) {
      if (dateRegex.test(line)) {
        if (currentPP.length > 0) {
          h.pp.push([...currentPP]);
          currentPP = [];
        }
        currentPP.push(line);
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
