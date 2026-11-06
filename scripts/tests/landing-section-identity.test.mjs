import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../../src/app/page.js", import.meta.url), "utf8");
const navigation = readFileSync(new URL("../../src/components/SiteNav.jsx", import.meta.url), "utf8");

test("keeps About and Tools as section identities while retaining the Who Am I tag", () => {
  assert.match(page, /<section id="about"/);
  assert.match(page, /<section id="tools"/);
  assert.match(page, /<section id="how-i-work"/);
  assert.match(navigation, /id: "about", label: "About", href: "#about"/);
  assert.match(navigation, /id: "tools", label: "Tools", href: "#tools"/);
  assert.match(navigation, /id: "how-i-work", label: "How I Work", href: "#how-i-work"/);
  assert.match(page, /Who Am I\?/);
  assert.match(page, /const SECTION_IDS = \["projects", "about", "tools", "services", "how-i-work", "contact"\]/);
  assert.match(navigation, /const ids = \["projects", "about", "tools", "services", "how-i-work", "contact"\]/);
  assert.match(page, /href="#about"/);
});

test("adds reveal behavior to Who Am I, Tools, What can I do, and How I Work headings", () => {
  assert.match(page, /import Reveal from "@\/components\/Reveal"/);
  assert.match(page, /import "@\/components\/reveal\.css"/);
  const about = page.match(/function WhoAmI\(\) \{[\s\S]*?(?=\nfunction ToolsMarquee\()/)?.[0];
  const tools = page.match(/function ToolsMarquee\(\) \{[\s\S]*?(?=\nfunction WhatCanIDo\()/)?.[0];
  const services = page.match(/function WhatCanIDo\(\) \{[\s\S]*?(?=\nfunction WorkProcess\()/)?.[0];
  const process = page.match(/function WorkProcess\(\) \{[\s\S]*?(?=\nconst CARD_DEF)/)?.[0];

  assert.ok(about, "expected Who Am I component");
  assert.ok(tools, "expected Tools component");
  assert.ok(services, "expected What can I do component");
  assert.ok(process, "expected How I Work component");
  assert.match(about, /<Reveal[^>]*variant="fade"/);
  assert.match(about, /<Reveal[^>]*variant="up"/);
  assert.match(tools, /<Reveal[^>]*variant="fade"/);
  assert.match(tools, /<Reveal[^>]*variant="up"/);
  assert.match(tools, /Tools • \{tools\.length\} tools/);
  assert.match(tools, /Tools I <span/);
  assert.match(
    services,
    /<Reveal as="p" variant="fade"[^>]*>[\s\S]*?<\/Reveal>\s*<Reveal as="h2" variant="up" delay=\{120\}[^>]*>[\s\S]*?What can I do\?[\s\S]*?<\/Reveal>/
  );
  assert.match(process, /<Reveal[^>]*variant="fade"/);
  assert.match(process, /<Reveal[^>]*variant="up"/);
});

test("uses the requested tag shapes for Skills and How I Work", () => {
  const about = page.match(/function WhoAmI\(\) \{[\s\S]*?(?=\nfunction ToolsMarquee\()/)?.[0] || "";
  const tools = page.match(/function ToolsMarquee\(\) \{[\s\S]*?(?=\nfunction WhatCanIDo\()/)?.[0] || "";
  const services = page.match(/function WhatCanIDo\(\) \{[\s\S]*?(?=\nfunction WorkProcess\()/)?.[0] || "";
  const process = page.match(/function WorkProcess\(\) \{[\s\S]*?(?=\nconst CARD_DEF)/)?.[0] || "";

  assert.match(about, /<svg[^>]*data-section-icon="triangle"/);
  assert.match(about, /<path[^>]*d="M12 2 22 21H2L12 2Z"/);
  assert.match(tools, /<span[^>]*rounded-full[^>]*bg-\[#7AB8E8\]/);
  assert.match(tools, /Tools • \{tools\.length\} tools/);
  assert.match(services, /<svg[^>]*data-section-icon="hexagon"/);
  assert.match(services, /<path[^>]*d="M6 3H18L22 12 18 21H6L2 12Z"/);
  assert.match(process, /<svg[^>]*data-section-icon="star-four"/);
  assert.match(process, /<path[^>]*d="M12 1C13.7 7.3 16.7 10.3 23 12 16.7 13.7 13.7 16.7 12 23 10.3 16.7 7.3 13.7 1 12 7.3 10.3 10.3 7.3 12 1Z"/);
});

test("matches active sidebar indicators to the landing section tags", () => {
  assert.match(navigation, /id: "projects", label: "Projects", href: "#projects", activeShape: "square"/);
  assert.match(navigation, /id: "about", label: "About", href: "#about", activeShape: "triangle"/);
  assert.match(navigation, /id: "tools", label: "Tools", href: "#tools", activeShape: "circle"/);
  assert.match(navigation, /id: "services", label: "Services", href: "#services", activeShape: "hexagon"/);
  assert.match(navigation, /id: "how-i-work", label: "How I Work", href: "#how-i-work", activeShape: "star-four"/);
  assert.match(navigation, /data-active-shape=\{item\.activeShape \|\| "circle"\}/);
});
