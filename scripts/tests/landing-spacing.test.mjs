import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../../src/app/page.js", import.meta.url), "utf8");
const footer = readFileSync(new URL("../../src/components/SiteFooter.jsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");

test("extends the footer's white gradient independently of intro spacing", () => {
  assert.match(styles, /--footer-glow-height:\s*clamp\(180px,\s*25vh,\s*260px\)/);
  assert.match(styles, /background-size:\s*100%\s+var\(--footer-glow-height\)/);
});

test("fills the viewport with the footer and increases its scroll reveal", () => {
  assert.match(styles, /\.footer-surface\s*\{[^}]*min-height:\s*100svh;/s);
  assert.match(styles, /\.footer-spacer\s*\{\s*height:\s*100svh;/);
  assert.match(footer, /const FOOTER_REVEAL_OFFSET = 600;/);
  assert.match(footer, /const off = \(1 - progress\) \* FOOTER_REVEAL_OFFSET;/);
  assert.match(footer, /translate3d\(0,\$\{FOOTER_REVEAL_OFFSET\}px,0\)/);
});

test("adds spacing between Tools, Skills, and How I Work while preserving top padding", () => {
  assert.doesNotMatch(page, /h-8 lg:h-10 bg-\[#0a0a0a\]/);
  assert.match(page, /id="about" className="[^"]*pt-\[96px\] lg:pt-\[176px\] pb-16 lg:pb-\[144px\]/);
  assert.match(page, /pt-\[72px\] lg:pt-\[128px\] pb-6 lg:pb-8/);
  assert.match(page, /id="tools" className="[^"]*pt-\[72px\] lg:pt-\[128px\] pb-16 lg:pb-24/);
  assert.match(page, /relative z-30 pb-16 lg:pb-\[120px\] space-y-2/);
  assert.match(page, /<section id="services" className="relative bg-\[#0a0404\] border-t border-white\/\[0\.06\]/);
  assert.match(page, /<div className="mx-auto max-w-\[1840px\][^"]*pb-16 lg:pb-\[208px\] xl:pb-\[224px\]">/);
  assert.match(page, /pt-\[96px\] lg:pt-0 pb-6 lg:pb-8 xl:pb-4/);
  assert.match(page, /xl:pt-\[104px\]/);
  assert.match(page, /<section id="how-i-work" className="relative bg-\[#0a0404\] border-b border-white\/\[0\.06\]/);
  assert.match(page, /<div className="mx-auto w-full max-w-\[1840px\][^"]*pb-\[77px\] lg:pb-\[128px\] xl:pb-\[83px\]">/);
});

test("blends About into Tools without a boundary line", () => {
  const aboutSection = page.match(/<section id="about"[\s\S]*?<\/section>/)?.[0];
  const toolsSections = [...page.matchAll(/<section id="tools"[^>]*>/g)].map(([section]) => section);

  assert.ok(aboutSection, "expected About section");
  assert.equal(toolsSections.length, 2, "expected loading and populated Tools sections");
  assert.match(aboutSection, /bg-\[#0a0404\]/);
  assert.doesNotMatch(aboutSection, /absolute bottom-0 inset-x-0 h-px bg-white\/\[0\.06\]/);
  for (const section of toolsSections) {
    assert.match(section, /bg-\[#0a0404\]/);
    assert.match(section, /border-b/);
    assert.doesNotMatch(section, /border-y/);
  }
});

test("uses a continuous shared background between Skills and How I Work", () => {
  const skills = page.match(/<section id="services"[^>]*>/)?.[0] || "";
  const process = page.match(/function WorkProcess\(\) \{[\s\S]*?(?=\nconst CARD_DEF)/)?.[0] || "";
  const processSection = process.match(/<section id="how-i-work"[^>]*>/)?.[0] || "";

  assert.match(skills, /bg-\[#0a0404\]/);
  assert.doesNotMatch(skills, /border-b/);
  assert.doesNotMatch(processSection, /border-t/);
  assert.match(processSection, /bg-\[#0a0404\]/);
});

test("adds scroll space after Work Process before the footer", () => {
  const sectionAndSpacer = /<WorkProcess \/>[\s\S]*?<div className="([^"]*)" aria-hidden \/>/;
  const match = page.match(sectionAndSpacer);

  assert.ok(match, "expected a spacer after WorkProcess");
  assert.ok(match[1].startsWith("h-16 lg:h-24 xl:h-32 bg-[#0a0404]"));
});
