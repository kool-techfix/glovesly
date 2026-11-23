import type { Transition, Variants } from "motion/react";

/*
 * Scroll-reveal variants (Motion). Each has a "hidden" and a "show" state.
 * Only opacity, transforms and filter are animated (GPU-friendly, no layout).
 */

export const REVEAL_NAMES = [
  "fade-in",
  "fade-up",
  "fade-down",
  "slide-left",
  "slide-right",
  "scale-in",
  "blur-reveal",
] as const;
export type RevealName = (typeof REVEAL_NAMES)[number];
/** A specific reveal, or "auto" for the controlled pseudo-random pick. */
export type RevealChoice = RevealName | "auto";

const EASE: Transition["ease"] = [0.22, 0.61, 0.36, 1];
const SHOW: Transition = { duration: 0.7, ease: EASE };

export const REVEALS: Record<RevealName, Variants> = {
  "fade-in": { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } } },
  "fade-up": { hidden: { opacity: 0, y: 35 }, show: { opacity: 1, y: 0, transition: SHOW } },
  "fade-down": { hidden: { opacity: 0, y: -25 }, show: { opacity: 1, y: 0, transition: SHOW } },
  // "Slide from left" starts left of its place (negative x) and moves right.
  "slide-left": { hidden: { opacity: 0, x: -45 }, show: { opacity: 1, x: 0, transition: SHOW } },
  "slide-right": { hidden: { opacity: 0, x: 45 }, show: { opacity: 1, x: 0, transition: SHOW } },
  "scale-in": { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: SHOW } },
  "blur-reveal": { hidden: { opacity: 0, filter: "blur(8px)" }, show: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } } },
};

/*
 * The pool the "auto" pick draws from. Ordered and weighted so neighbouring
 * picks vary and left/right moves balance out: two of each horizontal slide,
 * fade-up (the calmest) a little more often, and no direction dominating.
 */
const POOL: RevealName[] = [
  "fade-up",
  "slide-left",
  "scale-in",
  "slide-right",
  "blur-reveal",
  "fade-down",
  "fade-up",
  "slide-right",
  "fade-in",
  "slide-left",
];

/** djb2 string hash: stable, cheap, the same on server and client. */
function hash(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Controlled pseudo-random reveal for a component instance. The seed is
 * React's useId(), which is identical on the server and the client and stable
 * across re-renders, so there is no hydration mismatch and no reshuffling.
 */
export function pickReveal(seed: string): RevealName {
  return POOL[hash(seed) % POOL.length]!;
}

/** Container that only orchestrates its children (stagger), with no motion of its own. */
export function staggerContainer(stagger = 0.12, delay = 0.05): Variants {
  return { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } };
}

/**
 * When a section counts as "in view": once its top has come about 12% up
 * from the bottom of the screen, once only. "some" + a margin (rather than a
 * fraction of the element) also works for very tall blocks, such as a long
 * one-column list on a phone, which never fit 20% of themselves on screen.
 */
export const VIEWPORT = { once: true, amount: "some", margin: "0px 0px -12% 0px" } as const;
