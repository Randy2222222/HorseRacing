// parsePP.js
// Phase 1 DEV parser — organizes decoded text into blocks we can inspect

export function parsePP(decodedText) {
  // Split into lines and clean blanks
  const lines = decodedText
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // DEV Structure (what we will show in the dev panel)
  const structure = {
    rawLines: lines,
    raceLines: [],
    ppBlocks: [],
    unknown: []
  };
  //Detect When each Horse PP starts and ends
  function splitHorses(fullText) {
  const horses = [];
  let m;

  while ((m = HORSE_ANCHOR.exec(fullText)) !== null) {
    horses.push({
      post: m[1],        // 1, 2, 3, ...
      name: m[2].trim(), // Horse name
      style: m[3],       // P, E, S, EP...
      index: m.index
    });
  }

  // Slice each horse's block
  for (let i = 0; i < horses.length; i++) {
    const start = horses[i].index;
    const end = (i < horses.length - 1)
      ? horses[i + 1].index
      : fullText.length;

    horses[i].block = fullText.slice(start, end).trim();
  }

  return horses;
}
  // Basic line pattern detection
  const dateRegex = /^\d{2}[A-Za-z]{3}\d{2}/;  // e.g. "09Oct25"
  const fractionRegex = /^(:?\d{1,2}:\d{2}|\:\d{2})/;
  const jockeyRegex = /[A-Za-z]+\s?[A-Za-z]+$/;

  let currentBlock = [];

  for (let line of lines) {

    // Detect the start of a new PP block
    if (dateRegex.test(line)) {
      // Close previous block
      if (currentBlock.length > 0) {
        structure.ppBlocks.push([...currentBlock]);
        currentBlock = [];
      }
      currentBlock.push(line);
      continue;
    }

    // Add lines that belong to the current block
    if (currentBlock.length > 0) {
      currentBlock.push(line);
      continue;
    }

    // Otherwise mark as unknown (we’ll categorize later)
    structure.unknown.push(line);
  }

  // Push last open block
  if (currentBlock.length > 0) {
    structure.ppBlocks.push([...currentBlock]);
  }

  return structure;
}
