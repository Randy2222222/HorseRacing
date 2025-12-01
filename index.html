<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- PDF.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.min.js"></script>
  <script>
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";
  </script>
<!-- Create Horse Racing Form -->
  <title>Create Horse Racing Form</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>

  <!-- Blue Header -->
  <header>
    <h1>Create Horse Racing Form</h1>
  </header>

  <!-- Upload PDf Box (Matches your CSS exactly) -->
  <div id="pdf-upload">
    <h2>Brisnet PDF</h2>

  
    <input type="file" id="pdfFile">
       <!--Ready – click Create -->
    <p id="pdfStatus">Ready — click Create.</p>
    <!-- Button Run Create -->
    <button id="runCreate">Run Create</button>
  </div>

  <!-- Program Output Area -->
  <div id="program-output">
    <pre id="output"></pre>
  </div>

  <div id="dev-panels">

  <div style="border:1px solid #666; padding:10px; margin:10px;">
    <strong>RAW TEXT (DEV MODE)</strong>
    <pre id="devRawOutput"></pre>
  </div>

  <div style="border:1px solid #666; padding:10px; margin:10px;">
    <strong>CLEAN TEXT (NO Â)</strong>
    <pre id="devCleanOutput"></pre>
  </div>

  <div style="border:1px solid #666; padding:10px; margin:10px;">
    <strong>DECODED TEXT (GLYPH MAP)</strong>
    <pre id="devDecodedOutput"></pre>
  </div>
    
  <div style="border:1px solid #666; padding:10px; margin:10px;">
    <strong>PARSED STRUCTURE (DEV MODE)</strong>
    <pre id="devStructOutput"></pre>
  </div>
    

</div>

  <!-- Your JS Files -->
 
   <script type="module">
  import { readPDFAndDecode } from "./js/pdfReader.js";
  import { parsePP } from "./js/parsePP.js";

  // When user selects a PDF file, show page count immediately
document.getElementById("pdfFile").addEventListener("change", async () => {
  const file = document.getElementById("pdfFile").files[0];
  if (!file) return;

  const pdf = await pdfjsLib.getDocument({ url: URL.createObjectURL(file) }).promise;
  document.getElementById("pdfStatus").textContent =
      `PDF loaded successfully (${pdf.numPages} pages)`;
});

  document.getElementById("runCreate").addEventListener("click", async () => {
  const file = document.getElementById("pdfFile").files[0];
  if (!file) return alert("Select a PDF first!");

  const decoded = await readPDFAndDecode(file);

  // PHASE 1 parse
  const structure = parsePP(decoded);

  // Show structure in dev panel
  const out = document.getElementById("devStructOutput");
  if (out) out.textContent = JSON.stringify(structure, null, 2);
});
</script>
  <script src="js/horseGraph.js"></script>
  <script src="js/jockeyLoader.js"></script>
  <script src="js/calls.js"></script>
 <!-- <script src="js/analyzer.js"></script> -->

</body>
</html>
