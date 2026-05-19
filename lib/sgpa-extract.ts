"use client";

import { SubjectEntry, GRADE_POINTS } from "@/lib/sgpa-calc";

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  pdfjsLib = lib;
  return lib;
}

const VALID_GRADES = new Set(Object.keys(GRADE_POINTS)); // O E A B C D F

export interface ExtractedSheet {
  subjects: Omit<SubjectEntry, "id" | "isBacklog">[];
  method: "pdf-text" | "ocr";
  rawText: string;
}

// ─── Regex helpers (never reuse stateful /g instances — always create fresh) ─

/** BPUT subject code: 2–8 letters, a digit, 0–9 alphanums.  Upper limit raised
 *  to 8 because OCR misreads 0→O/Q, turning e.g. "RBCIB002" into "RBCIBOO2"
 *  (7 letters before the trailing digit).  Case-insensitive. */
const CODE_SRC = String.raw`\b([A-Za-z]{2,8}\d[A-Za-z0-9]{0,9})\b`;

/** Credit (1–8, optionally .5) then grade letter.
 *  Also accepts digit "0" in the grade slot (OCR reads O as 0).              */
const CG_SRC = String.raw`\b([1-8](?:\.5)?)\s+([OEABCDFoeabcdf0])\b`;

function codeRe(flags = "")  { return new RegExp(CODE_SRC, flags); }
function cgRe(flags = "")    { return new RegExp(CG_SRC,  flags);  }

/**
 * Normalise bracket-encoded grades that BPUT PDFs produce for withheld or
 * specially-formatted results.  Examples seen in the wild:
 *   [e] → E   (square-bracket wrap, lowercase)
 *   [E] → E   (square-bracket wrap, uppercase)
 *   fe] → E   (OCR reads '[' as 'f')
 *   [¢] → C   (OCR reads 'C' as cent sign inside brackets)
 */
function normalizeBracketGrades(text: string): string {
  return text
    .replace(/\[([OEABCDFoeabcdf])\]/g, (_, g) => g.toUpperCase())
    .replace(/f([eEaAbBcCdDfFoO])\]/g,  (_, g) => g.toUpperCase())
    .replace(/\[¢\]/g, "C");
}

/** Fix common OCR misreadings in the grade position. */
function fixGrade(g: string): string {
  const MAP: Record<string, string> = {
    "0": "O", "o": "O", "e": "E", "a": "A",
    "b": "B", "c": "C", "d": "D", "f": "F",
  };
  return MAP[g] ?? g.toUpperCase();
}

// ─── PDF text extraction (one page at a time to avoid Y-collision) ───────────

interface RawItem { x: number; y: number; str: string; }

/** Extract text items page-by-page and reconstruct rows with sequential
 *  Y-grouping (8 pt tolerance).  Processing per page prevents items from
 *  different pages being merged when their PDF Y-coordinates overlap.        */
async function pdfLines(file: File): Promise<{ lines: string[]; rawText: string }> {
  const pdfjs = await getPdfjs();
  const buf   = await file.arrayBuffer();
  const doc   = await pdfjs.getDocument({ data: buf }).promise;

  const allLines: string[] = [];
  let   rawText = "";

  for (let p = 1; p <= doc.numPages; p++) {
    const page    = await doc.getPage(p);
    const content = await page.getTextContent();

    // Collect valid text items for this page only.
    const items: RawItem[] = [];
    for (const raw of content.items as any[]) {
      if (typeof raw.str === "string" && raw.str.trim()) {
        items.push({ x: raw.transform[4], y: raw.transform[5], str: raw.str });
      }
    }
    if (items.length === 0) continue;

    // Sort top-to-bottom (Y descends in PDF coords), left-to-right within a row.
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    // Sequential Y-grouping — compare each item to the FIRST item in the
    // current bucket (the "anchor").  This avoids the rounding-boundary
    // artifacts that plagued the Math.round(y/T)*T approach.
    const rows: RawItem[][] = [[items[0]]];
    for (let i = 1; i < items.length; i++) {
      const anchor = rows[rows.length - 1][0];
      if (Math.abs(items[i].y - anchor.y) <= 8) {
        rows[rows.length - 1].push(items[i]);
      } else {
        rows.push([items[i]]);
      }
    }

    for (const row of rows) {
      const line = row.sort((a, b) => a.x - b.x).map(r => r.str).join(" ").trim();
      if (line) allLines.push(line);
    }

    // Build raw text in reading order for the blob parser.
    rawText += items.map(r => r.str).join(" ") + "\n";
  }

  return { lines: allLines, rawText };
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

type PartialSubject = Omit<SubjectEntry, "id" | "isBacklog">;

/**
 * Blob parser — the most robust approach.
 *
 * Scans the entire normalised text sequentially for subject codes.  For each
 * code, the "segment" runs from just after the code to just before the next
 * code (or +200 chars, whichever is smaller).  We pick the LAST credit+grade
 * pair in that segment so that L/T/P columns that precede the credits column
 * are skipped automatically.
 *
 * This handles:
 *   • Trailing columns (marks, PASS/FAIL) — grade is no longer anchored to $
 *   • Column-order PDFs where each cell is at a slightly different Y
 *   • Mixed-case OCR output (codes normalised, grades fixed)
 */
function blobParse(text: string, source: string): PartialSubject[] {
  const norm = normalizeBracketGrades(text.replace(/\s+/g, " "));

  // Collect every code occurrence with its start/end positions.
  const codes: Array<{ code: string; start: number; end: number }> = [];
  for (const m of norm.matchAll(codeRe("g"))) {
    codes.push({
      code:  m[1].toUpperCase(),
      start: m.index!,
      end:   m.index! + m[0].length,
    });
  }

  const results: PartialSubject[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < codes.length; i++) {
    const { code, end } = codes[i];
    if (seen.has(code)) continue;

    // Segment ends where the next code begins (or at +200 chars).
    const segEnd = i + 1 < codes.length
      ? codes[i + 1].start
      : Math.min(end + 200, norm.length);
    const seg = norm.slice(end, segEnd);

    // Last credit+grade pair in the segment.
    const cgMatches = [...seg.matchAll(cgRe("g"))];

    if (cgMatches.length === 0) {
      // Code visible in marksheet but credit/grade unreadable — emit blank so
      // the user can fill it in manually rather than losing the row silently.
      const name = seg.replace(/^\d{1,3}\s+/, "").replace(/(\s+\d){2,3}\s*$/, "").trim().slice(0, 80) || code;
      seen.add(code);
      results.push({ code, name, credits: 0, grade: "", source });
      continue;
    }

    const last    = cgMatches[cgMatches.length - 1];
    const credits = parseFloat(last[1]);
    const grade   = fixGrade(last[2]);

    const nameRaw = seg.slice(0, last.index).trim();
    const name = nameRaw
      .replace(/^\d{1,3}\s+/, "")           // strip leading serial number
      .replace(/(\s+\d){2,3}\s*$/, "")      // strip trailing L T P (e.g. "3 1 0")
      .trim() || code;

    seen.add(code);
    // Emit even when grade is unrecognised — user will see the warning and fix it.
    results.push({ code, name, credits, grade: VALID_GRADES.has(grade) ? grade : "", source });
  }

  return results;
}

/**
 * Line parser — works well for clean digital PDFs where each table row lands
 * on one reconstructed line.  Complements the blob parser.
 */
function lineParse(lines: string[], source: string): PartialSubject[] {
  const results: PartialSubject[] = [];

  for (const raw of lines) {
    const line = normalizeBracketGrades(raw.replace(/\s+/g, " ").trim());
    if (line.length < 8) continue;

    const cm = codeRe().exec(line);
    if (!cm) continue;
    const code  = cm[1].toUpperCase();
    const after = line.slice(cm.index + cm[0].length).trim();

    const cgs = [...after.matchAll(cgRe("g"))];

    if (cgs.length === 0) {
      const name = after.replace(/^\d{1,3}\s+/, "").replace(/(\s+\d){2,3}\s*$/, "").trim().slice(0, 80) || code;
      results.push({ code, name, credits: 0, grade: "", source });
      continue;
    }

    const last    = cgs[cgs.length - 1];
    const credits = parseFloat(last[1]);
    const grade   = fixGrade(last[2]);

    const name = after.slice(0, last.index)
      .trim()
      .replace(/^\d{1,3}\s+/, "")
      .replace(/(\s+\d){2,3}\s*$/, "")
      .trim() || code;

    results.push({ code, name, credits, grade: VALID_GRADES.has(grade) ? grade : "", source });
  }

  return results;
}

/**
 * Merge result sets. Keeps first occurrence of each code, but upgrades an
 * incomplete entry (missing grade/credits) if a later set has a complete one.
 */
function dedup(...sets: PartialSubject[][]): PartialSubject[] {
  const order: string[] = [];
  const best = new Map<string, PartialSubject>();

  for (const s of sets.flat()) {
    const existing = best.get(s.code);
    const complete = (e: PartialSubject) => e.credits > 0 && e.grade !== "";
    if (!existing) {
      order.push(s.code);
      best.set(s.code, s);
    } else if (!complete(existing) && complete(s)) {
      best.set(s.code, s);
    }
  }

  return order.map((c) => best.get(c)!);
}

// ─── OCR helpers ──────────────────────────────────────────────────────────────

/** Grayscale + contrast stretch → cleaner letterforms for Tesseract. */
function preprocess(src: HTMLCanvasElement): HTMLCanvasElement {
  const dst = document.createElement("canvas");
  dst.width  = src.width;
  dst.height = src.height;
  const ctx = dst.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, dst.width, dst.height);
  const d   = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // Aggressively push towards black or white.
    const c = g < 140
      ? Math.max(0,   g * 0.5)
      : Math.min(255, 80 + (g - 140) * 1.8);
    d[i] = d[i + 1] = d[i + 2] = c;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return dst;
}

/**
 * Load an image File into a preprocessed canvas.
 * Scales up small images so Tesseract has enough resolution.
 */
async function imageToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale  = Math.max(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(preprocess(canvas));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

async function pdfCanvases(file: File): Promise<HTMLCanvasElement[]> {
  const pdfjs = await getPdfjs();
  const buf   = await file.arrayBuffer();
  const doc   = await pdfjs.getDocument({ data: buf }).promise;
  const out:  HTMLCanvasElement[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page     = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 3 }); // 3× for sharp OCR input
    const cv       = document.createElement("canvas");
    cv.width  = viewport.width;
    cv.height = viewport.height;
    await page.render({ canvasContext: cv.getContext("2d")!, viewport }).promise;
    out.push(preprocess(cv));
  }
  return out;
}

async function ocr(
  source: HTMLCanvasElement,
  onProgress?: (p: number) => void,
): Promise<string> {
  const { default: Tesseract } = await import("tesseract.js");
  const { data } = await Tesseract.recognize(source, "eng", {
    logger: (m: any) => {
      if (m.status === "recognizing text" && onProgress) onProgress(m.progress);
    },
  } as any);
  return data.text;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function extractSubjectsFromFile(
  file: File,
  onProgress?: (stage: string, p?: number) => void,
): Promise<ExtractedSheet> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    onProgress?.("Reading PDF…");
    const { lines, rawText } = await pdfLines(file);

    // Run both parsers and merge — blob handles column-order PDFs,
    // line handles clean row-per-line PDFs.  First code occurrence wins.
    const subjects = dedup(
      blobParse(rawText, file.name),
      lineParse(lines,   file.name),
    );

    if (subjects.length > 0) {
      return { subjects, method: "pdf-text", rawText };
    }

    // No text found → scanned PDF, fall back to Tesseract OCR.
    onProgress?.("Scanned PDF — running OCR…");
    const canvases = await pdfCanvases(file);
    let ocrText = "";
    for (const cv of canvases) {
      ocrText += await ocr(cv, (p) => onProgress?.("Running OCR…", p)) + "\n";
    }
    return {
      subjects: dedup(
        blobParse(ocrText,           file.name),
        lineParse(ocrText.split("\n"), file.name),
      ),
      method:  "ocr",
      rawText: ocrText,
    };
  }

  // Image / screenshot — preprocess then OCR.
  onProgress?.("Preparing image…");
  const canvas  = await imageToCanvas(file);
  onProgress?.("Running OCR on image…");
  const ocrText = await ocr(canvas, (p) => onProgress?.("Running OCR…", p));
  return {
    subjects: dedup(
      blobParse(ocrText,           file.name),
      lineParse(ocrText.split("\n"), file.name),
    ),
    method:  "ocr",
    rawText: ocrText,
  };
}
