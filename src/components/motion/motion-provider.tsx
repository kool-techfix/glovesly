"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/*
 * Motion for the public site. LazyMotion + domAnimation keeps the bundle lean
 * (only the animation features used here); `strict` makes sure components use
 * the light `m.*` elements. (Loading the features as a separate chunk was
 * measured and saved nothing: the bundler keeps them with `m` anyway.) reducedMotion="user" follows the visitor's
 * prefers-reduced-motion setting: transforms (movement, scale) are skipped and
 * only opacity changes remain.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
