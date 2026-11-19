/**
 * Design rule: no gradients. Solid colours from the token set only (CLAUDE.md, Conventions).
 *
 * Scans src/ for CSS gradient functions, Tailwind gradient utilities and colour stops,
 * SVG gradient definitions and url(#…) paint references, gradient text and gradient borders.
 * Prints file:line for every hit and exits 1 if there are any.
 *
 * Run: pnpm check:gradients
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SCAN_DIRS = ["src"];
const EXTENSIONS = new Set([".css", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".svg", ".html", ".md", ".mdx"]);

const TAILWIND_COLOURS =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const TOKEN_COLOURS =
  "primary|primary-hover|accent|secondary|background|foreground|muted|muted-foreground|border|ring|card|white|black|transparent|current|inherit";

const RULES: { name: string; pattern: RegExp }[] = [
  { name: "CSS gradient function", pattern: /\b(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i },
  { name: "CSS gradient function", pattern: /-webkit-gradient\s*\(/i },
  { name: "Tailwind gradient utility", pattern: /(?<![\w-])bg-(?:gradient|linear|radial|conic)-/ },
  {
    name: "Tailwind gradient colour stop",
    pattern: new RegExp(
      `(?<![\\w-])(?:[a-z]+:)*(?:from|via|to)-(?:\\[|(?:${TOKEN_COLOURS})(?![\\w-])|(?:${TAILWIND_COLOURS})-\\d{2,3}\\b)`,
    ),
  },
  { name: "SVG gradient element", pattern: /<(?:linearGradient|radialGradient)\b/ },
  { name: "url(#…) paint reference", pattern: /(?:fill|stroke)\s*[=:]\s*["'{]?\s*url\(\s*#/i },
  { name: "gradient text", pattern: /(?<![\w-])bg-clip-text\b|background-clip\s*:\s*text/i },
  { name: "gradient border", pattern: /\bborder-image(?:-source)?\s*:/i },
];

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (EXTENSIONS.has(path.slice(path.lastIndexOf(".")))) files.push(path);
  }
  return files;
}

const hits: string[] = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (rule.pattern.test(line)) {
          hits.push(`${relative(ROOT, file)}:${index + 1}  ${rule.name}: ${line.trim().slice(0, 140)}`);
          break;
        }
      }
    });
  }
}

if (hits.length > 0) {
  console.error(`Found ${hits.length} gradient use(s). Use a solid token colour instead (CLAUDE.md, Conventions):\n`);
  console.error(hits.join("\n"));
  process.exit(1);
}
console.log(`No gradients found in ${SCAN_DIRS.join(", ")}/.`);
