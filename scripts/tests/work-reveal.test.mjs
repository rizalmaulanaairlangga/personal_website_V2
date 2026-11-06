import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => {
  const url = new URL(path, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
};

const page = read("../../src/app/work/[slug]/page.js");
const moreProjects = read("../../src/app/work/[slug]/MoreProjects.jsx");
const screenshotGallery = read("../../src/app/work/[slug]/ScreenshotGallery.jsx");
const galleryReveal = read("../../src/app/work/[slug]/GalleryReveal.jsx");
const galleryCss = read("../../src/app/work/[slug]/gallery.css");
const reveal = read("../../src/components/Reveal.jsx");
const hook = read("../../src/hooks/useReveal.js");
const revealCss = read("../../src/components/reveal.css");

test("provides reusable reveal variants, reduced motion, and mobile offsets", () => {
  assert.match(revealCss, /\[data-reveal="fade"\]/);
  assert.match(revealCss, /\[data-reveal="up"\]/);
  assert.match(revealCss, /\[data-reveal="scale"\]/);
  assert.match(revealCss, /\[data-reveal="slide-x"\]/);
  assert.match(revealCss, /\[data-reveal="phone"\]/);
  assert.match(revealCss, /\[data-reveal="clip"\]/);
  assert.match(revealCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(revealCss, /max-width:\s*768px/);
});

test("reveals immediate content after paint and disconnects scroll observers once", () => {
  assert.match(hook, /requestAnimationFrame/);
  assert.match(hook, /new IntersectionObserver/);
  assert.match(hook, /activeObserver\.disconnect\(\)/);
  assert.match(hook, /prefers-reduced-motion/);
  assert.match(reveal, /data-reveal=\{clipVariant \? "fade" : variant\}/);
  assert.match(reveal, /--reveal-delay/);
  assert.match(reveal, /variant === "clip"/);
  assert.match(reveal, /data-reveal="clip"/);
});

test("assigns the requested immediate reveals throughout the detail hero", () => {
  assert.match(page, /variant="fade" immediate/);
  assert.match(page, /variant="up" delay=\{80\} immediate/);
  assert.match(page, /delay=\{200\} immediate/);
  assert.match(page, /delay=\{260\} immediate/);
  assert.match(page, /delay=\{project\.repo_link \? 320 : 260\} immediate/);
  assert.match(page, /360 \+ index \* 90/);
  assert.match(page, /variant="fade" delay=\{720\} immediate/);
  assert.match(page, /760 \+ index \* 50/);
  assert.match(page, /variant="scale" delay=\{900\} immediate/);
});

test("assigns one-time scroll reveals to project details and gallery", () => {
  assert.match(page, /variant="up" delay=\{120\}/);
  assert.match(page, /variant="up" delay=\{240\}/);
  assert.match(screenshotGallery, /variant="phone" rot="-6deg" waitForImages/);
  assert.match(screenshotGallery, /variant="phone" rot="4deg" delay=\{150\} waitForImages/);
  assert.match(screenshotGallery, /variant="clip" className="desktop-showcase" waitForImages/);
  assert.match(page, /variant="up" delay=\{150\}/);
  assert.match(moreProjects, /variant="slide-x"/);
  assert.match(moreProjects, /delay=\{index \* 120\}/);
  assert.match(moreProjects, /variant="fade" delay=\{index \* 120 \+ 300\}/);
});

test("keeps image hover transforms inside project-card media", () => {
  assert.match(moreProjects, /className="project-card group/);
  assert.match(moreProjects, /className="project-card__media absolute inset-0"/);
  assert.match(revealCss, /\.project-card__media img/);
  assert.match(revealCss, /\.project-card:hover \.project-card__media img/);
  assert.doesNotMatch(galleryReveal, /new IntersectionObserver/);
  assert.match(galleryCss, /\.device-row\s*\{[^}]*opacity:\s*1/s);
  assert.match(galleryCss, /\.desktop-frame\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(galleryCss, /\.desktop-img\s*\{[^}]*height:\s*100%/s);
  assert.match(screenshotGallery, /alt=\{alt\(desktopBelow,[\s\S]*?loading="eager"/);
});
