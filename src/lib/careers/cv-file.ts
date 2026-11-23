import { CV_TYPES, cvExtension, cvProblem, type CvKind } from "@/lib/careers/cv-rules";

/*
 * Server-side CV check: extension, MIME type, size, non-empty AND magic bytes,
 * so a renamed .exe (or anything else) is rejected before it is uploaded.
 * Never logs file contents.
 */

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]; // legacy .doc (Compound File)
const ZIP = [0x50, 0x4b, 0x03, 0x04]; // .docx is a ZIP package

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

function containsAscii(bytes: Uint8Array, needle: string) {
  const target = Array.from(needle, (c) => c.charCodeAt(0));
  outer: for (let i = 0; i <= bytes.length - target.length; i++) {
    for (let j = 0; j < target.length; j++) if (bytes[i + j] !== target[j]) continue outer;
    return true;
  }
  return false;
}

function matchesKind(kind: CvKind, bytes: Uint8Array): boolean {
  if (kind === "pdf") return startsWith(bytes, PDF);
  if (kind === "doc") return startsWith(bytes, OLE);
  // A Word document package has a word/ part.
  return startsWith(bytes, ZIP) && containsAscii(bytes, "word/");
}

/** "My CV (final).PDF" → "My-CV-final.pdf". Keeps a safe, readable name for staff. */
export function sanitiseFilename(filename: string, kind: CvKind): string {
  const base = filename.split(/[\\/]/).pop() ?? "cv";
  const stem = base
    .replace(/\.[^.]*$/, "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return `${stem || "cv"}.${kind}`;
}

export type CheckedCv = { kind: CvKind; filename: string; bytes: Uint8Array; size: number; mime: string };

/** Returns the checked file, or a message for the "cv" field. */
export async function checkCv(file: unknown): Promise<CheckedCv | { error: string }> {
  if (!file || typeof file !== "object" || !("arrayBuffer" in file) || !("name" in file)) {
    return { error: "Attach your CV" };
  }
  const upload = file as File;
  const problem = cvProblem({ name: upload.name, size: upload.size });
  if (problem) return { error: problem };
  const kind = cvExtension(upload.name)!;
  // Some systems send a generic type for Word files; the magic bytes still decide.
  const mime = upload.type || "application/octet-stream";
  if (mime !== CV_TYPES[kind].mime && mime !== "application/octet-stream") {
    return { error: "This file does not look like a PDF or Word document" };
  }
  const bytes = new Uint8Array(await upload.arrayBuffer());
  if (bytes.length === 0) return { error: "This file is empty. Choose another file" };
  if (!matchesKind(kind, bytes)) {
    return { error: "This file does not look like a real PDF or Word document. Save it again as PDF, DOC or DOCX" };
  }
  return { kind, filename: sanitiseFilename(upload.name, kind), bytes, size: bytes.length, mime: CV_TYPES[kind].mime };
}
