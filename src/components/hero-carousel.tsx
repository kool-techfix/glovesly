"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { ButtonLink, Eyebrow } from "@/components/site";
import type { HeroSlide } from "@/data/content";
import { cn } from "@/lib/utils";

/*
 * ICAADA's home hero slideshow (BRAND.md §5), ported with the blue primary.
 *
 * Timing is driven by the active progress bar's CSS animation: when it ends the
 * carousel advances. Pausing (hover, keyboard focus, the toggle) pauses that
 * animation, so the bar and the slide change can never drift apart, and
 * resuming continues from where the bar stopped. No timers.
 */

/** Auto-advance interval in ms. Mirrored in CSS as --hero-interval. */
export const HERO_INTERVAL_MS = 6500;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

type HeroCarouselProps = {
  slides: HeroSlide[];
  /** Accessible name for the carousel region. */
  label?: string;
};

export function HeroCarousel({ slides, label = "Highlights" }: HeroCarouselProps) {
  const baseId = useId();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const total = slides.length;
  const multiple = total > 1;
  const autoplayAllowed = multiple && !reducedMotion && !userPaused;
  const playing = autoplayAllowed && !hovered && !keyboardFocused;

  if (total === 0) return null;

  const slideId = (i: number) => `${baseId}-slide-${i}`;

  /** Change slide. When focus would be stranded in a now-inert slide, move it to the new one. */
  const goTo = (next: number, focus: "tab" | "slide" | null = null) => {
    const target = ((next % total) + total) % total;
    flushSync(() => setIndex(target));
    if (focus === "tab") tabRefs.current[target]?.focus();
    if (focus === "slide") slideRefs.current[target]?.querySelector<HTMLElement>("a, button")?.focus();
  };

  const focusInSlides = () => slideRefs.current.some((slide) => slide?.contains(document.activeElement));

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!multiple || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const onTab = tabRefs.current.includes(document.activeElement as HTMLButtonElement);
    const focus = onTab ? "tab" : focusInSlides() ? "slide" : null;
    goTo(index + (event.key === "ArrowRight" ? 1 : -1), focus);
  };

  // Pause only for keyboard focus (:focus-visible), so a mouse click on a control
  // does not leave autoplay stuck after the pointer moves away.
  const onFocus = (event: React.FocusEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.matches(":focus-visible")) setKeyboardFocused(true);
  };
  const onBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboardFocused(false);
  };

  const active = slides[index]!;

  return (
    <section
      className={cn("hero-carousel", reducedMotion && "is-reduced-motion")}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      style={{ "--hero-interval": `${HERO_INTERVAL_MS}ms` } as React.CSSProperties}
      data-testid="region-hero-carousel"
    >
      <div className="hero-slides" id={`${baseId}-slides`}>
        {slides.map((slide, i) => {
          const isActive = i === index;
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div
              key={slide.id}
              id={slideId(i)}
              ref={(node) => {
                slideRefs.current[i] = node;
              }}
              className={cn("hero-slide", isActive && "is-active")}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              <div className="hero-slide-media" aria-hidden={slide.image.src ? undefined : true}>
                {slide.image.src ? (
                  <>
                    <Image
                      src={slide.image.src}
                      alt={slide.image.alt}
                      fill
                      sizes="100vw"
                      className="hero-slide-image"
                      {...(i === 0 ? { preload: true } : { loading: "lazy" as const })}
                    />
                    <span className="hero-slide-shade" />
                  </>
                ) : (
                  // TODO(content): no photo yet. Solid accent until a Cloudinary image is supplied.
                  <span className="hero-slide-fallback" />
                )}
              </div>
              <div className="container-wide hero-slide-content">
                <Eyebrow onDark>{slide.eyebrow}</Eyebrow>
                <Heading className="display hero-title">{slide.title}</Heading>
                <p className="hero-text">{slide.text}</p>
                <div className="hero-actions">
                  <ButtonLink href={slide.primaryCta.href} testId={`link-hero-primary-${i + 1}`}>
                    {slide.primaryCta.label}
                  </ButtonLink>
                  <ButtonLink href={slide.secondaryCta.href} variant="secondary" onDark testId={`link-hero-secondary-${i + 1}`}>
                    {slide.secondaryCta.label}
                  </ButtonLink>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {multiple ? (
        <div className="hero-controls">
          <div className="container-wide hero-controls-inner">
            <div className="hero-pages" role="tablist" aria-label="Choose a slide">
              {slides.map((slide, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={slide.id}
                    ref={(node) => {
                      tabRefs.current[i] = node;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={slideId(i)}
                    aria-label={`Slide ${i + 1} of ${total}: ${slide.title}`}
                    tabIndex={isActive ? 0 : -1}
                    className="hero-page focus-ring"
                    onClick={() => goTo(i)}
                    data-testid={`button-hero-page-${i + 1}`}
                  >
                    <span className="hero-page-track">
                      {isActive ? (
                        <span
                          // Remount on every slide change so the fill restarts from zero.
                          key={`fill-${index}`}
                          className="hero-page-fill"
                          style={{ animationPlayState: playing ? "running" : "paused" }}
                          onAnimationEnd={() => {
                            if (autoplayAllowed) goTo(index + 1);
                          }}
                          data-playing={playing}
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="hero-buttons">
              <button
                type="button"
                className="hero-control focus-ring"
                aria-controls={`${baseId}-slides`}
                aria-label="Previous slide"
                onClick={() => goTo(index - 1)}
                data-testid="button-hero-prev"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              {reducedMotion ? null : (
                <button
                  type="button"
                  className="hero-control focus-ring"
                  aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                  onClick={() => setUserPaused((paused) => !paused)}
                  data-testid="button-hero-toggle"
                >
                  {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
                </button>
              )}
              <button
                type="button"
                className="hero-control focus-ring"
                aria-controls={`${baseId}-slides`}
                aria-label="Next slide"
                onClick={() => goTo(index + 1)}
                data-testid="button-hero-next"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Polite only while autoplay is not running, so automatic changes are never announced. */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic="true">
        {`Slide ${index + 1} of ${total}: ${active.title}`}
      </p>
    </section>
  );
}
