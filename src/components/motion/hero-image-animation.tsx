"use client";

import { m, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
 * Slow cinematic zoom and drift for one hero slide's photo. When its slide
 * becomes active, the photo scales up and drifts sideways over ~6s; the
 * direction alternates from slide to slide. When the slide goes inactive it
 * eases back, so the move replays next time. Nothing animates while the hero
 * is scrolled out of view, and reduced motion (MotionConfig) skips it.
 *
 * The drift is capped by the zoom's overflow ((scale - 1) / 2 × width) so the
 * photo never uncovers the edge of its frame, even on a 320px screen. The
 * frame (.hero-slide-media) has overflow: hidden and the image object-fit:
 * cover, so nothing is distorted.
 */

type Move = { scale: number; x: number };

/** Slides 1–3 as specified; further slides keep alternating left/right. */
const MOVES: Move[] = [
  { scale: 1.12, x: -25 },
  { scale: 1.12, x: 25 },
  { scale: 1.15, x: -15 },
  { scale: 1.12, x: 25 },
  { scale: 1.12, x: -25 },
];

const ACTIVE = { duration: 6, ease: [0.25, 0.46, 0.45, 0.94] as const };
const RESET = { duration: 1, ease: [0.4, 0, 0.2, 1] as const };

export function HeroImageAnimation({ index, active, children }: { index: number; active: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  // Reduced motion: no zoom or drift at all (MotionConfig alone would jump straight to the end state).
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const move = MOVES[index % MOVES.length]!;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry!.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Never drift further than the zoom has grown past each edge.
  const maxShift = width ? ((move.scale - 1) / 2) * width * 0.9 : Math.abs(move.x);
  const x = Math.sign(move.x) * Math.min(Math.abs(move.x), maxShift);

  const animate = reduced ? { scale: 1, x: 0 } : active ? (inView && width ? { scale: move.scale, x } : undefined) : { scale: 1, x: 0 };
  return (
    <m.div
      ref={ref}
      className="hero-image-motion"
      initial={{ scale: 1, x: 0 }}
      animate={animate}
      transition={active ? ACTIVE : RESET}
    >
      {children}
    </m.div>
  );
}
