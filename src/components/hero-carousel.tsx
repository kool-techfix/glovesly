"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { HeroImage, markHeroReady } from "@/components/hero-image";
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

  // No photo on the first slide: nothing to wait for, so the page loader can go.
  const firstHasImage = Boolean(slides[0]?.image.src);
  useEffect(() => {
    if (!firstHasImage) markHeroReady();
  }, [firstHasImage]);

  /*
   * Which slides may load their photo. Inactive slides sit in the same place
   * as the first (just transparent), so native lazy loading would fetch every
   * photo at once and compete with the first slide's LCP image. Instead: the
   * first slide now, the next one once the page has loaded, and on every
   * change the new slide plus the one after it, so a photo is always ready
   * before its slide appears.
   */
  const [wanted, setWanted] = useState<ReadonlySet<number>>(() => new Set([0]));
  const want = (...indexes: number[]) =>
    setWanted((current) => (indexes.every((i) => current.has(i)) ? current : new Set([...current, ...indexes])));
  useEffect(() => {
    if (slides.length < 2) return;
    const next = () => want(1 % slides.length);
    if (document.readyState === "complete") {
      const timer = window.setTimeout(next, 0);
      return () => window.clearTimeout(timer);
    }
    window.addEventListener("load", next, { once: true });
    return () => window.removeEventListener("load", next);
  }, [slides.length]);

  const total = slides.length;
  const multiple = total > 1;
  const autoplayAllowed = multiple && !reducedMotion && !userPaused;
  const playing = autoplayAllowed && !hovered && !keyboardFocused;

  if (total === 0) return null;

  const slideId = (i: number) => `${baseId}-slide-${i}`;

  /** Change slide. When focus would be stranded in a now-inert slide, move it to the new one. */
  const goTo = (next: number, focus: "tab" | "slide" | null = null) => {
    const target = ((next % total) + total) % total;
    flushSync(() => {
      setIndex(target);
      want(target, (target + 1) % total);
    });
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
                  wanted.has(i) ? (
                  <>
                    <HeroImage
                      src={slide.image.src}
                      alt={slide.image.alt}
                      sizes="100vw"
                      priority={i === 0}
                      signalReady={i === 0}
                      className="hero-slide-image"
                    />
                    <span className="hero-slide-shade" />
                  </>
                  ) : null
                ) : (
                  // TODO(content): no photo yet. Flat navy until a Cloudinary image is supplied.
                  <span className="hero-slide-fallback" />
                )}
              </div>
              {/* The first slide's text rises in with .reveal (held while the page loader is up). */}
              <div className="container-wide hero-slide-content">
                <Eyebrow onDark className={cn(i === 0 && "reveal")}>
                  {slide.eyebrow}
                </Eyebrow>
                <Heading className={cn("display hero-title", i === 0 && "reveal reveal-delay-1")}>{slide.title}</Heading>
                {slide.text ? <p className={cn("hero-text", i === 0 && "reveal reveal-delay-2")}>{slide.text}</p> : null}
                <div className={cn("hero-actions", i === 0 && "reveal reveal-delay-3")}>
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
