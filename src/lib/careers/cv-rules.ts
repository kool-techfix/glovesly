/*
 * CV rules shared by the form (checked before upload) and the server (which
 * also checks the file's magic bytes, see src/lib/careers/cv-file.ts).
 */

export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const CV_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const CV_TYPES = {
  pdf: { mime: "application/pdf", label: "PDF" },
  doc: { mime: "application/msword", label: "Word (DOC)" },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Word (DOCX)" },
} as const;
export type CvKind = keyof typeof CV_TYPES;

export function cvExtension(filename: string): CvKind | null {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  return ext in CV_TYPES ? (ext as CvKind) : null;
}

/** Human size: "1.2 MB", "340 KB". */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Quick checks on the client (and the server repeats them): type by extension, size, not empty. */
export function cvProblem(file: { name: string; size: number }): string | null {
  if (!cvExtension(file.name)) return "Upload your CV as a PDF, DOC or DOCX file";
  if (file.size === 0) return "This file is empty. Choose another file";
  if (file.size > CV_MAX_BYTES) return `This file is ${formatBytes(file.size)}. The maximum size is 5 MB`;
  return null;
}
