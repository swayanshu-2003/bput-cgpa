"use client";

// Lazy-loaded so pdf.js / tesseract.js never run on the server.
let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  pdfjsLib = lib;
  return lib;
}

export interface Extracted {
  sgpa: number | null;
  credits: number | null;
  rawText: string;
  method: "pdf-text" | "ocr";
}

/**
 * Pull SGPA and total credits out of OCR/PDF text.
 * Handles BPUT result pages: "SGPA : 9.17", "S.G.P.A 9.17",
 * "Total Credits : 23", "Credits Earned : 23", etc.
 */
export function parseValues(text: string): { sgpa: number | null; credits: number | null } {
  const norm = text.replace(/\s+/g, " ");

  // Match "SGPA", "S.G.P.A", "S G P A" with optional separator
  const sgpaMatch =
    norm.match(/S\.?\s*G\.?\s*P\.?\s*A\.?\s*[:\-=]?\s*([0-9]{1,2}(?:\.[0-9]{1,3})?)/i) ??
    null;

  // Match various credit label formats
  const creditsMatch =
    norm.match(/Total\s*Credits?\s*[:\-=]?\s*([0-9]{1,3}(?:\.[0-9]{1,2})?)/i) ??
    norm.match(/Credits?\s*Earned\s*[:\-=]?\s*([0-9]{1,3}(?:\.[0-9]{1,2})?)/i) ??
    norm.match(/Earned\s*Credits?\s*[:\-=]?\s*([0-9]{1,3}(?:\.[0-9]{1,2})?)/i) ??
    norm.match(/Credit\s*Points?\s*[:\-=]?\s*([0-9]{1,3}(?:\.[0-9]{1,2})?)/i) ??
    null;

  const sgpa    = sgpaMatch    ? clamp(parseFloat(sgpaMatch[1]),    0,   10) : null;
  const credits = creditsMatch ? clamp(parseFloat(creditsMatch[1]), 1, 300) : null;
  return { sgpa, credits };
}

function clamp(n: number, min: number, max: number): number | null {
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/** Grayscale + contrast stretch for cleaner Tesseract input. */
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
      // Ensure at least 2 000 px on the longer side for reliable OCR.
      const scale  = Math.max(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
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

/** Extract the selectable text layer from a PDF (no OCR). */
async function pdfText(file: File): Promise<string> {
  const pdfjs = await getPdfjs();
  const buf   = await file.arrayBuffer();
  const doc   = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const page    = await doc.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map((i: any) => i.str).join(" ") + "\n";
  }
  return text;
}

/** Render PDF pages to preprocessed canvases (for OCR fallback on scanned PDFs). */
async function pdfToCanvases(file: File): Promise<HTMLCanvasElement[]> {
  const pdfjs = await getPdfjs();
  const buf   = await file.arrayBuffer();
  const doc   = await pdfjs.getDocument({ data: buf }).promise;
  const out: HTMLCanvasElement[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page     = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 2.5 });
    const canvas   = document.createElement("canvas");
    canvas.width   = viewport.width;
    canvas.height  = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    out.push(preprocess(canvas));
  }
  return out;
}

async function ocr(
  source: HTMLCanvasElement,
  onProgress?: (p: number) => void
): Promise<string> {
  const { default: Tesseract } = await import("tesseract.js");
  const { data } = await Tesseract.recognize(source, "eng", {
    logger: (m: any) => {
      if (m.status === "recognizing text" && onProgress) onProgress(m.progress);
    },
  } as any);
  return data.text;
}

/**
 * Main entry: PDF → try text layer first, OCR fallback if scanned.
 * Image → preprocess → OCR.
 */
export async function extractFromFile(
  file: File,
  onProgress?: (stage: string, p?: number) => void
): Promise<Extracted> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    onProgress?.("Reading PDF text…");
    const text   = await pdfText(file);
    const parsed = parseValues(text);
    if (parsed.sgpa !== null || parsed.credits !== null) {
      return { ...parsed, rawText: text, method: "pdf-text" };
    }
    // Scanned PDF — fall back to OCR.
    onProgress?.("Scanned PDF — running OCR…");
    const canvases = await pdfToCanvases(file);
    let ocrText = "";
    for (const c of canvases) {
      ocrText += (await ocr(c, (p) => onProgress?.("Running OCR…", p))) + "\n";
    }
    return { ...parseValues(ocrText), rawText: ocrText, method: "ocr" };
  }

  // Image / screenshot — preprocess then OCR.
  onProgress?.("Preparing image…");
  const canvas  = await imageToCanvas(file);
  onProgress?.("Running OCR on image…");
  const ocrText = await ocr(canvas, (p) => onProgress?.("Running OCR…", p));
  return { ...parseValues(ocrText), rawText: ocrText, method: "ocr" };
}
