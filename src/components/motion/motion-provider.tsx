"use client";

import { LazyMotion, MotionConfig } from "motion/react";

/** domAnimation, fetched as its own chunk after the page starts (not in the initial bundle). */
const loadFeatures = () => import("@/components/motion/features").then((module) => module.default);

/*
 * Motion for the public site. LazyMotion + domAnimation keeps the bundle lean
 * (only the animation features used here), loaded asynchronously so they stay
 * out of the initial JavaScript; `strict` makes sure components use the light
 * `m.*` elements. reducedMotion="user" follows the visitor's
 * prefers-reduced-motion setting: transforms (movement, scale) are skipped and
 * only opacity changes remain.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
