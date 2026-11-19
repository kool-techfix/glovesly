import { toParagraphs } from "@/lib/display";
import { cn } from "@/lib/utils";

/** Editor text (plain textarea) rendered as paragraphs. No HTML is interpreted. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = toParagraphs(text);
  if (!paragraphs.length) return null;
  return (
    <div className={cn("prose-body", className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
