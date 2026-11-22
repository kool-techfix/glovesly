"use client";

import Image from "next/image";
import { useState } from "react";

import { cloudinaryLoader, isCloudinaryDelivery } from "@/lib/cloudinary-loader";
import { cn } from "@/lib/utils";

/*
 * Hero photo: fills its parent, fades in over the navy background once loaded
 * (500ms; none under reduced motion, see .hero-image in globals.css), and is
 * served as an optimised Cloudinary variant.
 *
 * `signalReady` (the first hero image on a page): when it has loaded, sets
 * data-hero-ready="true" on <html> and dispatches "hero:ready", which the page
 * loader waits for. It also marks the <img> with data-hero-image so the loader
 * knows the page has a hero image to wait for.
 */
export function markHeroReady() {
  if (document.documentElement.dataset.heroReady === "true") return;
  document.documentElement.dataset.heroReady = "true";
  window.dispatchEvent(new Event("hero:ready"));
}

export function HeroImage({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  signalReady = false,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  signalReady?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loader={isCloudinaryDelivery(src) ? cloudinaryLoader : undefined}
      // Next 16: `preload` (replaces `priority`) inserts a <link rel="preload"> in <head>, so the
      // request starts before the page loader finishes. The docs advise not to add fetchPriority too.
      {...(priority ? { preload: true } : { loading: "lazy" as const })}
      className={cn("hero-image", loaded && "is-loaded", className)}
      data-hero-image={signalReady ? "" : undefined}
      onLoad={() => {
        setLoaded(true);
        if (signalReady) markHeroReady();
      }}
      onError={() => {
        // Never hold the loader on a broken image.
        if (signalReady) markHeroReady();
      }}
    />
  );
}
