import { ImageResponse } from "next/og";

/*
 * Site-wide default share image (Open Graph and, via page metadata, Twitter):
 * flat navy with an amber marker, the company name and its one-line
 * description. No photos, no gradients. Pages that have their own image
 * (e.g. a news post with a cover) override it in their metadata.
 */

export const alt = "Glovesly Pro-Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#0B2A4A",
          color: "#FFFFFF",
        }}
      >
        <div style={{ width: 72, height: 6, background: "#F5A400", marginBottom: 40 }} />
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>Glovesly Pro-Project</div>
        <div style={{ marginTop: 32, fontSize: 34, lineHeight: 1.4, maxWidth: 960, color: "#D7E3F0" }}>
          A Nigerian company working in aviation infrastructure, construction, security solutions and energy solutions.
        </div>
      </div>
    ),
    size,
  );
}
