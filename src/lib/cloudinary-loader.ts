import type { ImageLoaderProps } from "next/image";

/*
 * next/image loader for Cloudinary delivery URLs: asks Cloudinary for a
 * resized, auto-format (AVIF/WebP), auto-quality variant straight from its CDN,
 * e.g. .../image/upload/f_auto,q_auto,c_limit,w_1600/v123/glovesly/x.jpg.
 * c_limit never upscales. Any other URL is returned unchanged.
 *
 * Client-only (a function prop); use it through <HeroImage> or other client
 * components.
 */
const UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

export function isCloudinaryDelivery(src: string): boolean {
  return UPLOAD.test(src);
}

export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const match = UPLOAD.exec(src);
  if (!match) return src;
  const transforms = ["f_auto", quality ? `q_${quality}` : "q_auto", "c_limit", `w_${width}`].join(",");
  return `${match[1]}${transforms}/${match[2]}`;
}
