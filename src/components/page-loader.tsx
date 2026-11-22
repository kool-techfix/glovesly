"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/*
 * "Runway" page loader: a white overlay with the logo and a row of 16 dashes,
 * shown once per browser session on the first page load.
 *
 * The whole sequence runs from LOADER_HEAD_SCRIPT (inline in <head>, plain
 * JavaScript), so it works the same before React has hydrated, on slow
 * networks and slow phones. React only renders the markup (in the root
 * layout's server HTML, so it is there at first paint) and unmounts it when
 * the script reports "loader:done".
 *
 * - Before first paint the script sets "loader-active" on <html> (show it,
 *   lock scroll, hold the .reveal animations) or "no-loader" (already shown in
 *   this session, or an /admin page).
 * - The dashes run on CSS (staggered delays) and hold amber on the 15th.
 * - Progress is real: complete when document.fonts.ready has resolved AND the
 *   hero image has loaded (data-hero-ready on <html>), or the page has no hero
 *   image. Then all 16 light up. Minimum 600ms visible; at 2500ms the reveal
 *   starts regardless.
 * - Reveal: logo and dashes fade (250ms), the two white halves slide apart
 *   (750ms), then the page is released. Reduced motion: a 200ms fade only.
 * - Hero images are marked loaded by the same script (capture-phase "load"
 *   listener), so they fade in and unblock the loader before hydration.
 * - The hero image request is never delayed: it is preloaded from <head>.
 */

export const LOADER_SESSION_KEY = "glovesly-loaded";
const DASHES = 16;

/** Inline in <head>, before first paint. Plain ES5, no dependencies. */
export const LOADER_HEAD_SCRIPT = `(function(){
var d=document.documentElement,k="${LOADER_SESSION_KEY}";
function h(e){var t=e.target;if(!t||!t.classList||!t.classList.contains("hero-image"))return;if(e.type==="load")t.setAttribute("data-loaded","");if(t.hasAttribute("data-hero-image")&&d.dataset.heroReady!=="true"){d.dataset.heroReady="true";window.dispatchEvent(new Event("hero:ready"))}}
document.addEventListener("load",h,true);document.addEventListener("error",h,true);
try{if(location.pathname.indexOf("/admin")===0||sessionStorage.getItem(k)){d.classList.add("no-loader");return}}catch(e){d.classList.add("no-loader");return}
d.classList.add("loader-active");
var done=false,fonts=!document.fonts,poll,max;
function save(){try{sessionStorage.setItem(k,"1")}catch(e){}}
function release(){d.classList.remove("loader-active");d.classList.add("no-loader");var r=document.getElementById("page-root");if(r){r.inert=false;r.removeAttribute("aria-hidden")}save();window.__loaderDone=true;window.dispatchEvent(new Event("loader:done"))}
function heroReady(){return d.dataset.heroReady==="true"||(document.readyState!=="loading"&&!document.querySelector("[data-hero-image]"))}
function finish(){if(done)return;done=true;clearInterval(poll);clearTimeout(max);save();
var L=document.querySelector('[data-testid="page-loader"]');if(!L){release();return}
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches){L.classList.add("is-fading");setTimeout(release,200);return}
L.classList.remove("is-loading");L.classList.add("is-complete");
setTimeout(function(){L.classList.add("is-fading")},120);
setTimeout(function(){L.classList.add("is-opening")},370);
setTimeout(release,1120)}
function check(){if(!done&&fonts&&heroReady()&&performance.now()>=600)finish()}
if(document.fonts)document.fonts.ready.then(function(){fonts=true;check()},function(){fonts=true;check()});
window.addEventListener("hero:ready",check);
poll=setInterval(check,100);
max=setTimeout(finish,2500);
})();`.replace(/\n/g, "");

/** Inline right after the page content: inert and hidden from assistive tech while the overlay is up. */
export const LOADER_INERT_SCRIPT = `(function(){if(document.documentElement.classList.contains("loader-active")){var r=document.getElementById("page-root");if(r){r.inert=true;r.setAttribute("aria-hidden","true")}}})();`;

declare global {
  interface Window {
    __loaderDone?: boolean;
  }
}

export function PageLoader() {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    // Not shown (repeat visit, /admin) or already finished before hydration.
    if (!html.classList.contains("loader-active") || window.__loaderDone) {
      const frame = requestAnimationFrame(() => setMounted(false));
      return () => cancelAnimationFrame(frame);
    }
    const onDone = () => setMounted(false);
    window.addEventListener("loader:done", onDone);
    return () => window.removeEventListener("loader:done", onDone);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="page-loader is-loading"
      role="status"
      aria-live="polite"
      data-testid="page-loader"
      // The head script changes the phase classes directly, before and after hydration.
      suppressHydrationWarning
    >
      <span className="page-loader-panel page-loader-panel--top" aria-hidden="true" />
      <span className="page-loader-panel page-loader-panel--bottom" aria-hidden="true" />
      <div className="page-loader-content">
        <Image src="/brand/glovely-logo.png" alt="" width={44} height={44} loading="eager" className="page-loader-logo" />
        <ol className="page-loader-runway" aria-hidden="true">
          {Array.from({ length: DASHES }, (_, i) => (
            <li key={i} className="page-loader-dash" style={{ "--i": i } as React.CSSProperties} />
          ))}
        </ol>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
