"use client";

import Image, { type ImageProps } from "next/image";

import { cloudinaryLoader, isCloudinaryDelivery } from "@/lib/cloudinary-loader";

/**
 * next/image that asks Cloudinary for an f_auto,q_auto,w_<n> variant when the
 * source is a Cloudinary delivery URL (other sources go through next/image as
 * usual). Lazy by default; pass `preload` only for an LCP image.
 */
export function CloudinaryImage({ alt, ...props }: ImageProps & { src: string }) {
  return (
    <Image
      alt={alt}
      loading={props.preload ? undefined : "lazy"}
      {...props}
      loader={isCloudinaryDelivery(props.src) ? cloudinaryLoader : undefined}
    />
  );
}
