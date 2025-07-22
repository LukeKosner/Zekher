import fs from "fs/promises";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

async function getTextSizes(pdfDoc: any, pageNum: number) {
  const page = await pdfDoc.getPage(pageNum);
  const textContent = await page.getTextContent();

  const textInfo = textContent.items.map((item: any) => ({
    text: item.str,
    fontSize: item.height,
    fontName: item.fontName,
    x: item.transform[4],
    y: item.transform[5],
    actualSize: item.height * Math.abs(item.transform[3])
  }));

  return textInfo;
}

function cleanLeadingCommaQuote(text: string): string {
  // Check first 4 characters for patterns like ", "" or ",""
  const firstFour = text.substring(0, 4);

  // Remove ", " at the very beginning
  if (firstFour.startsWith(', "')) {
    return text.substring(3);
  }

  // Remove "," at the very beginning
  if (firstFour.startsWith(',"')) {
    return text.substring(2);
  }

  return text;
}

function normalizeTitle(title: string): string {
  return (
    title
      // replace underscores with spaces
      .replace(/_/g, " ")
      // replace multiple spaces with a single space
      .replace(/\s+/g, " ")
      // flip "Last, First" to "First Last" format
      .replace(/^(.+),\s*(.+)$/, "$2 $1")
      // Smart title case for all-caps text
      .replace(/\b[A-Z]{2,}\b/g, (match) => {
        // Keep certain acronyms and abbreviations in all caps
        const keepAllCaps = [
          "PDF",
          "USA",
          "USSR",
          "UK",
          "EU",
          "UN",
          "NATO",
          "CIA",
          "FBI",
          "SS",
          "SA",
          "SD",
          "KGB",
          "NKVD",
          "WVHA",
          "RSHA",
          "HTO",
          "CFGJ",
          "AFSC",
          "AZEC",
          "UNWCC",
          "UNRRA",
          "UGIF",
          "OSE",
          "JDC",
          "HICEM",
          "CRIF",
          "CCIF",
          "FSJF",
          "AJDC",
          "AJCC",
          "AJCW",
          "AJYB",
          "AJHS",
          "CCGJ",
          "JUGJ",
          "RIJF",
          "RIJC",
          "RIJW",
          "RIJYB",
          "RIJHS",
          "RIJDC",
          "RIJCC",
          "RIJCW",
          // Roman numerals
          "II",
          "III",
          "IV",
          "VI",
          "VII",
          "VIII",
          "IX",
          "XI",
          "XII",
          "XIII",
          "XIV",
          "XV",
          "XVI",
          "XVII",
          "XVIII",
          "XIX",
          "XX",
          "XXI",
          "XXII",
          "XXIII",
          "XXIV",
          "XXV"
        ];
        if (keepAllCaps.includes(match)) {
          return match;
        }
        // Convert to title case: first letter caps, rest lowercase
        return match.charAt(0) + match.slice(1).toLowerCase();
      })
      // Fix common French articles to be lowercase
      .replace(/\bDes\b/g, "des")
      .replace(/\bDe\b/g, "de")
      .replace(/\bDu\b/g, "du")
      .replace(/\bLa\b/g, "la")
      .replace(/\bLe\b/g, "le")
      .replace(/\bLes\b/g, "les")
      // get rid of Hebrew
      .replace(/[\u0590-\u05FF]/g, "") // Hebrew characters
      .trim()
  );
}

async function extractPdfText(
  filePath: string
): Promise<{ content: string; extractedTitle?: string }> {
  const pdfDoc = await getDocument({
    url: filePath,
    verbosity: 0 // Suppress warnings
  }).promise;
  const numPages = pdfDoc.numPages;

  let allText = "";
  let extractedTitle: string | undefined;
  const largeFontTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const textInfo = await getTextSizes(pdfDoc, pageNum);

    // Filter out headers (font size > 16) and collect text
    const filteredText = textInfo
      .filter((item: any) => {
        if (item.fontSize > 16) {
          const titleText = item.text.trim();
          if (titleText && titleText.length > 2) {
            largeFontTexts.push(titleText);
          }
          console.log(
            `Large font (${item.fontSize}): "${item.text}" in ${path.basename(filePath)}`
          );
          return false;
        }
        return true;
      })
      .map((item: any) => item.text)
      .join(" ");

    allText += filteredText + " ";
  }

  // Try to extract title from large font texts
  if (largeFontTexts.length > 0) {
    // Take the longest large font text as the potential title
    extractedTitle = largeFontTexts
      .sort((a, b) => b.length - a.length)[0]
      .replace(/[\u0590-\u05FF]/g, "") // Remove Hebrew characters
      .trim();
  }

  // Clean up the text - first apply the specific leading comma-quote fix
  let text = cleanLeadingCommaQuote(allText)
    .replace(/^[,\s]*"?\s*\d+\s*/, "") // Remove leading comma, spaces, quotes, and numbers like ",    "     1"
    .replace(/^\/\s*,\s*/, "") // Remove leading "/ , " at start of file
    .replace(/^\/\s*/, "") // Remove leading "/ " or "/" at start of file
    .trim() // Remove leading/trailing whitespace
    .replace(/^\/\s*/, "") // Remove leading "/ " again after trimming
    .replace(/^,\s*"\s*/, "") // Remove leading ", " pattern
    .replace(/^,\s*"/, "") // Remove leading '," pattern without requiring space after quote
    .replace(/^__\s*,\s*"\s*/, "") // Remove leading "__ , " pattern
    .replace(/^[A-Z]{3,}\s*/, "") // Remove leading all-caps words like "CZESTOCHOWA"
    .replace(/[,\s]+"?\s*\d+\s+/g, " ") // Remove similar patterns in the middle of text
    .replace(/,\s*"\s*(?=\s|$)/g, " ") // Remove ", " only when followed by space or end of line
    .replace(/,\s*"\s*/g, " ") // Remove ', "' patterns anywhere in text
    .replace(/,\s*\\"\s*/g, " ") // Remove ', \"' patterns anywhere in text
    .replace(/```,\s*"\s*```,/g, "") // Remove pattern ```, " ```, which begins many otherwise-processed docs
    .replace(/\/\s{2,}/g, " ") // Remove "/ " only when there are 2+ spaces after the slash
    .replace(/\\_+\s*/g, " ") // Remove underscore sequences like "__ " and "___"
    .replace(/\\"/g, '"') // Replace \" with regular quotation marks
    .replace(/\s+\]/g, "]") // Remove spaces before closing brackets
    .replace(/\s+,/g, ",") // Remove spaces before commas
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .replace(/\n\s*\n/g, "\n") // Remove empty lines
    .replace(/__{2,}/g, " ") // Long underscore lines
    .replace(/\b\d+\s*\/\s*\d+\b/g, "") // Remove numbers like 1 / 1, 2 / 3, etc.
    .replace(/\b\d+\/\d+\b/g, "") // Remove numbers like 2/1, 10/5, etc.
    .replace(/(\d{4})--(\d{4})/g, "$1-$2") // Replace 1900--1900 with 1900-1900
    .replace(/\(\s*(\d{4})\s*-\s*(\d{4})\s*\)/g, "($1-$2)") // Fix spacing in dates like (1885 - 1944) to (1885-1944)
    .replace(/[\u0590-\u05FF]/g, "") // Remove Hebrew characters
    .replace(/\(\s+/g, "(") // Remove spaces after opening parentheses
    .replace(/\s+\)/g, ")") // Remove spaces before closing parentheses
    .replace(/\(see also ([^,]+),\s*([^)]+)\)/g, "(see also $2 $1)") // Reorder "see also" references: "United Partisan Organization, Vilna" -> "Vilna United Partisan Organization" (no comma)
    .replace(/\(see also ([^)]*)\.\s*([^)]+)\)/g, "(see also $1 $2)") // Remove periods in "see also" - change "Vilna. United Partisan Organization" to "Vilna United Partisan Organization"
    .replace(
      /Shoah Resource Center[,\s]*The International School for Holocaust Studies/gi,
      ""
    )
    .trim();

  // Remove specific all-caps titles that appear in file bodies
  text = text
    .replace(/\bCYPRUS DETENTION CAMPS\b/g, "")
    .replace(/\bCONSEIL REPRESENTATIF DES JUIFS DE FRANCE\b/g, "")
    .replace(/\bCONSISTOIRE CENTRAL DES ISRAELITES DE FRANCE\b/g, "")
    .replace(/\s+/g, " ") // Clean up extra spaces after removals
    .trim()
    .replace(/^\/\s*/, "") // Final cleanup - remove any remaining leading "/ " patterns
    .trim();

  // Check for multiple consecutive all-caps words and log them
  const allCapsPattern = /\b[A-Z]{2,}(?:\s+[A-Z]{2,})+\b/g;
  const allCapsMatches = text.match(allCapsPattern);
  if (allCapsMatches && allCapsMatches.length > 0) {
    console.log(
      `All-caps sequences in ${path.basename(filePath)}:`,
      [...new Set(allCapsMatches)].join(", ")
    );
  }

  return { content: text, extractedTitle };
}

async function processLexiconFile(filePath: string): Promise<void> {
  const filename = path.basename(filePath);

  // Check if filename has mostly capital letters (like CONSEIL_REPRESENTATIF_DES_JUIFS_DE_FRANCE.pdf)
  const fileBase = filename.replace(".pdf", "");
  if (fileBase.length >= 5) {
    const letters = fileBase.replace(/[^a-zA-Z]/g, "");
    if (letters.length >= 3) {
      const uppercaseCount = (letters.match(/[A-Z]/g) || []).length;
      const ratio = uppercaseCount / letters.length;
      if (ratio >= 0.8) {
        // 80% uppercase
        console.log(`Capital filename found: ${filename}`);
      }
    }
  }

  const result = await extractPdfText(filePath);
  const content = result.content;

  // Normalize the filename and write to sources/processed/lexicon directory
  const baseFilename = filename.replace(".pdf", "");
  const normalizedTitle = normalizeTitle(baseFilename);

  // Log title differences
  if (result.extractedTitle) {
    const normalizedExtractedTitle = normalizeTitle(result.extractedTitle);
    if (
      normalizedExtractedTitle.toLowerCase() !== normalizedTitle.toLowerCase()
    ) {
      console.log(`TITLE MISMATCH in ${filename}:`);
      console.log(
        `   Extracted from PDF: "${result.extractedTitle}" → "${normalizedExtractedTitle}"`
      );
      console.log(`   From filename: "${baseFilename}" → "${normalizedTitle}"`);
    }
  }

  // Write processed text to txt directory
  const txtOutputPath = path.join(
    process.env.LEXICON_PROCESSED_TXT_ROOT!,
    `${normalizedTitle}.txt`
  );
  await fs.writeFile(txtOutputPath, content);

  // Copy raw PDF to pdf directory with normalized name
  const pdfOutputPath = path.join(
    process.env.LEXICON_PROCESSED_PDF_ROOT!,
    `${normalizedTitle}.pdf`
  );
  await fs.copyFile(filePath, pdfOutputPath);
}

async function processTxtFile(filePath: string): Promise<void> {
  const filename = path.basename(filePath);
  console.log(`Processing txt file: ${filename}`);

  // Read the txt file content
  const content = await fs.readFile(filePath, "utf-8");

  // Apply the same text cleaning as PDFs - first apply the specific leading comma-quote fix
  let cleanedContent = cleanLeadingCommaQuote(content)
    .replace(/^[,\s]*"?\s*\d+\s*/, "") // Remove leading comma, spaces, quotes, and numbers like ",    "     1"
    .replace(/^\/\s*,\s*/, "") // Remove leading "/ , " at start of file
    .replace(/^\/\s*/, "") // Remove leading "/ " or "/" at start of file
    .replace(/^,\s*"\s*/, "") // Remove leading ", " pattern
    .replace(/^,\s*"/, "") // Remove leading '," pattern without requiring space after quote
    .replace(/^__\s*,\s*"\s*/, "") // Remove leading "__ , " pattern
    .replace(/^[A-Z]{3,}\s*/, "") // Remove leading all-caps words like "CZESTOCHOWA"
    .replace(/[,\s]+"?\s*\d+\s+/g, " ") // Remove similar patterns in the middle of text
    .replace(/,\s*"\s*(?=\s|$)/g, " ") // Remove ", " only when followed by space or end of line
    .replace(/,\s*"\s*/g, " ") // Remove ', "' patterns anywhere in text
    .replace(/,\s*\\"\s*/g, " ") // Remove ', \"' patterns anywhere in text
    .replace(/```,\s*"\s*```,/g, "") // Remove pattern ```, " ```, which begins many otherwise-processed docs
    .replace(/\/\s{2,}/g, " ") // Remove "/ " only when there are 2+ spaces after the slash
    .replace(/\\_+\s*/g, " ") // Remove underscore sequences like "__ " and "___"
    .replace(/\\"/g, '"') // Replace \" with regular quotation marks
    .replace(/\s+\]/g, "]") // Remove spaces before closing brackets
    .replace(/\s+,/g, ",") // Remove spaces before commas
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .replace(/__{3,}/g, " ")
    .replace(/\b\d+\s*\/\s*\d+\b/g, "") // Remove numbers like 1 / 1, 2 / 3, etc.
    .replace(/\b\d+\/\d+\b/g, "") // Remove numbers like 2/1, 10/5, etc.
    .replace(/(\d{4})--(\d{4})/g, "$1-$2") // Replace 1900--1900 with 1900-1900
    .replace(/\(\s*(\d{4})\s*-\s*(\d{4})\s*\)/g, "($1-$2)") // Fix spacing in dates like (1885 - 1944) to (1885-1944)
    .replace(/[\u0590-\u05FF]/g, "") // Remove Hebrew characters
    .replace(/\(\s+/g, "(") // Remove spaces after opening parentheses
    .replace(/\s+\)/g, ")") // Remove spaces before closing parentheses
    .replace(/\(see also ([^,]+),\s*([^)]+)\)/g, "(see also $2 $1)") // Reorder "see also" references
    .replace(/\(see also ([^)]*)\.\s*([^)]+)\)/g, "(see also $1 $2)") // Remove periods in "see also"
    .replace(
      /Shoah Resource Center[,\s]*The International School for Holocaust Studies/gi,
      ""
    )
    .trim();

  // Remove specific all-caps titles that appear in file bodies
  cleanedContent = cleanedContent
    .replace(/\bCYPRUS DETENTION CAMPS\b/g, "")
    .replace(/\bCONSEIL REPRESENTATIF DES JUIFS DE FRANCE\b/g, "")
    .replace(/\bCONSISTOIRE CENTRAL DES ISRAELITES DE FRANCE\b/g, "")
    .replace(/\s+/g, " ") // Clean up extra spaces after removals
    .trim();

  // Check for multiple consecutive all-caps words and log them
  const allCapsPattern = /\b[A-Z]{2,}(?:\s+[A-Z]{2,})+\b/g;
  const allCapsMatches = cleanedContent.match(allCapsPattern);
  if (allCapsMatches && allCapsMatches.length > 0) {
    console.log(
      `All-caps sequences in ${filename}:`,
      [...new Set(allCapsMatches)].join(", ")
    );
  }

  // Normalize the filename and write to sources/processed/txt directory
  const baseFilename = filename.replace(".txt", "");
  const normalizedTitle = normalizeTitle(baseFilename);
  const outputPath = path.join(
    process.env.LEXICON_PROCESSED_TXT_ROOT!,
    `${normalizedTitle}.txt`
  );
  await fs.writeFile(outputPath, cleanedContent);
}

async function main() {
  // get all pdf files in sources/raw/lexicon directory
  const lexiconDir = path.join(process.env.LEXICON_RAW_ROOT!);
  const processedTxtDir = path.join(process.env.LEXICON_PROCESSED_TXT_ROOT!);
  const processedPdfDir = path.join(process.env.LEXICON_PROCESSED_PDF_ROOT!);

  // Ensure processed directories exist
  await fs.mkdir(processedTxtDir, { recursive: true });
  await fs.mkdir(processedPdfDir, { recursive: true });

  const lexiconFiles = await fs.readdir(lexiconDir);

  for (const file of lexiconFiles) {
    if (file.endsWith(".pdf")) {
      const filePath = path.join(lexiconDir, file);
      await processLexiconFile(filePath).catch((err) => {
        console.error(`Error processing ${file}:`, err);
      });
    } else if (file.endsWith(".txt")) {
      const filePath = path.join(lexiconDir, file);
      await processTxtFile(filePath).catch((err) => {
        console.error(`Error processing ${file}:`, err);
      });
    } else {
      console.log(`Skipping non-pdf/txt file: ${file}`);
    }
  }

  // Generate lexicon.json after processing all files
  await generateLexiconJson();
}

async function generateLexiconJson(): Promise<void> {
  console.log("Generating lexicon.json...");

  const txtDir = path.join(process.env.LEXICON_PROCESSED_TXT_ROOT!);
  const pdfDir = path.join(process.env.LEXICON_PROCESSED_PDF_ROOT!);

  const txtFiles = await fs.readdir(txtDir);
  const lexiconEntries = [];

  for (const txtFile of txtFiles) {
    if (txtFile.endsWith(".txt")) {
      const title = txtFile.replace(".txt", "");
      const txtPath = path.join(txtDir, txtFile);
      const content = await fs.readFile(txtPath, "utf-8");

      // Check if corresponding PDF exists
      const pdfFile = `${title}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFile);
      const hasPdf = await fs
        .access(pdfPath)
        .then(() => true)
        .catch(() => false);

      // Create lexicon entry
      // Percent-encode spaces for URLs
      const encodedTxtFile = `sources/processed/lexicon/txt/${encodeURIComponent(txtFile)}`;
      const encodedPdfFile = `sources/processed/lexicon/pdf/${encodeURIComponent(pdfFile)}`;
      const entry = {
        title,
        content: content.trim(),
        txtFile: encodedTxtFile,
        ...(hasPdf && { pdfFile: encodedPdfFile })
      };

      lexiconEntries.push(entry);
    }
  }

  // Sort entries alphabetically by title
  lexiconEntries.sort((a, b) => a.title.localeCompare(b.title));

  // Write lexicon.json
  const lexiconPath = path.join(process.env.LEXICON_RAW_ROOT!, "lexicon.json");

  const lexiconData = {
    generated: new Date().toISOString(),
    totalEntries: lexiconEntries.length,
    entries: lexiconEntries
  };

  await fs.writeFile(lexiconPath, JSON.stringify(lexiconData, null, 2));
  console.log(`Generated lexicon.json with ${lexiconEntries.length} entries`);
}

async function fixExistingProcessedFiles(): Promise<void> {
  const txtDir = path.join(process.env.LEXICON_PROCESSED_TXT_ROOT!);

  try {
    const txtFiles = await fs.readdir(txtDir);

    for (const file of txtFiles) {
      if (file.endsWith(".txt")) {
        const filePath = path.join(txtDir, file);
        const content = await fs.readFile(filePath, "utf-8");

        // Apply the same cleaning as our updated processing
        const cleanedContent = cleanLeadingCommaQuote(content)
          .replace(/^[,\s]*"?\s*\d+\s*/, "") // Remove leading comma, spaces, quotes, and numbers
          .replace(/^\/\s*,\s*/, "") // Remove leading "/ , " at start of file
          .replace(/^\/\s*/, "") // Remove leading "/ " or "/" at start of file
          .trim()
          .replace(/^\/\s*/, "") // Remove leading "/ " again after trimming
          .replace(/^,\s*"\s*/, "") // Remove leading ", " pattern
          .replace(/^,\s*"/, "") // Remove leading '," pattern without requiring space after quote
          .replace(/^__\s*,\s*"\s*/, "") // Remove leading "__ , " pattern
          .replace(/^[A-Z]{3,}\s*/, "") // Remove leading all-caps words
          .replace(/[,\s]+"?\s*\d+\s+/g, " ") // Remove similar patterns in the middle of text
          .replace(/,\s*"\s*(?=\s|$)/g, " ") // Remove ", " only when followed by space or end of line
          .replace(/,\s*"\s*/g, " ") // Remove ', "' patterns anywhere in text
          .replace(/,\s*\\"\s*/g, " ") // Remove ', \"' patterns anywhere in text
          .replace(/```,\s*"\s*```,/g, "") // Remove pattern ```, " ```, which begins many otherwise-processed docs
          .replace(/\/\s{2,}/g, " ") // Remove "/ " only when there are 2+ spaces after the slash
          .replace(/\\_+\s*/g, " ") // Remove underscore sequences like "__ " and "___"
          .replace(/\\"/g, '"') // Replace \" with regular quotation marks
          .replace(/\s+\]/g, "]") // Remove spaces before closing brackets
          .replace(/\s+,/g, ",") // Remove spaces before commas
          .replace(/\s+/g, " ")
          .replace(/\n\s*\n/g, "\n")
          .replace(/__{3,}/g, " ")
          .replace(/\b\d+\s*\/\s*\d+\b/g, "")
          .replace(/\b\d+\/\d+\b/g, "")
          .replace(/(\d{4})--(\d{4})/g, "$1-$2")
          .replace(/\(\s*(\d{4})\s*-\s*(\d{4})\s*\)/g, "($1-$2)")
          .replace(/[\u0590-\u05FF]/g, "")
          .replace(/\(\s+/g, "(")
          .replace(/\s+\)/g, ")")
          .replace(/\(see also ([^,]+),\s*([^)]+)\)/g, "(see also $2 $1)")
          .replace(/\(see also ([^)]*)\.\s*([^)]+)\)/g, "(see also $1 $2)")
          .replace(
            /Shoah Resource Center[,\s]*The International School for Holocaust Studies/gi,
            ""
          )
          .replace(/\bCYPRUS DETENTION CAMPS\b/g, "")
          .replace(/\bCONSEIL REPRESENTATIF DES JUIFS DE FRANCE\b/g, "")
          .replace(/\bCONSISTOIRE CENTRAL DES ISRAELITES DE FRANCE\b/g, "")
          .replace(/\s+/g, " ")
          .trim();

        // Only write if content actually changed
        if (cleanedContent !== content) {
          await fs.writeFile(filePath, cleanedContent);
          console.log(`Fixed file: ${file}`);
        }
      }
    }

    console.log("Finished fixing existing processed files");
  } catch (error) {
    console.log("Error fixing existing processed files:", error);
  }
}

async function deleteProcessedFiles(): Promise<void> {
  const txtDir = path.join(process.env.LEXICON_PROCESSED_TXT_ROOT!);
  const pdfDir = path.join(process.env.LEXICON_PROCESSED_PDF_ROOT!);

  // Delete txt files
  try {
    const txtFiles = await fs.readdir(txtDir);
    for (const file of txtFiles) {
      const filePath = path.join(txtDir, file);
      await fs.unlink(filePath);
      console.log(`Deleted txt file: ${file}`);
    }
  } catch (error) {
    console.log("No txt files to delete or directory does not exist");
  }

  // Delete pdf files
  try {
    const pdfFiles = await fs.readdir(pdfDir);
    for (const file of pdfFiles) {
      const filePath = path.join(pdfDir, file);
      await fs.unlink(filePath);
      console.log(`Deleted pdf file: ${file}`);
    }
  } catch (error) {
    console.log("No pdf files to delete or directory does not exist");
  }

  // Delete old lexicon directory if it exists
  try {
    const oldLexiconDir = path.join(process.env.LEXICON_PROCESSED_ROOT!);
    const oldFiles = await fs.readdir(oldLexiconDir);
    for (const file of oldFiles) {
      const filePath = path.join(oldLexiconDir, file);
      await fs.unlink(filePath);
      console.log(`Deleted old lexicon file: ${file}`);
    }
  } catch (error) {
    console.log("No old lexicon files to delete");
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes("--delete") || args.includes("-d")) {
  deleteProcessedFiles().catch(console.error);
} else if (args.includes("--fix") || args.includes("-f")) {
  fixExistingProcessedFiles().catch(console.error);
} else {
  main().catch(console.error);
}
