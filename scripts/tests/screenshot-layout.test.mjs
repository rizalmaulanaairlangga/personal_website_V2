import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveScreenshotLayout,
  orderedMobileScreenshots,
} from "../../src/app/work/[slug]/screenshot-layout.mjs";

test("defaults missing layout metadata to responsive even when only mobile rows exist", () => {
  const layout = resolveScreenshotLayout(null, [
    { view_type: "mobile", sort_order: 2 },
    { view_type: "mobile", sort_order: 0 },
    { view_type: "mobile", sort_order: 1 },
  ]);

  assert.equal(layout, "responsive");
});

test("keeps mixed-device projects in responsive layout", () => {
  const layout = resolveScreenshotLayout("responsive", [
    { view_type: "mobile", sort_order: 0 },
    { view_type: "tablet", sort_order: 1 },
    { view_type: "desktop", sort_order: 3 },
  ]);

  assert.equal(layout, "responsive");
});

test("uses explicit mobile-only layout metadata", () => {
  const layout = resolveScreenshotLayout("mobile_only", []);

  assert.equal(layout, "mobile_only");
});

test("orders mobile screenshots by their stored sort order", () => {
  const rows = orderedMobileScreenshots([
    { view_type: "tablet", sort_order: 1, image_path: "tablet.png" },
    { view_type: "mobile", sort_order: 2, image_path: "third.png" },
    { view_type: "mobile", sort_order: 0, image_path: "first.png" },
    { view_type: "mobile", sort_order: 1, image_path: "second.png" },
  ]);

  assert.deepEqual(rows.map((row) => row.image_path), [
    "first.png",
    "second.png",
    "third.png",
  ]);
});

test("returns only the distinct stored screenshots for one, two, or three phones", () => {
  const rows = [
    { view_type: "mobile", sort_order: 0, image_path: "one.png" },
    { view_type: "mobile", sort_order: 1, image_path: "two.png" },
    { view_type: "mobile", sort_order: 2, image_path: "three.png" },
  ];

  for (const count of [1, 2, 3]) {
    const available = orderedMobileScreenshots(rows.slice(0, count));
    assert.equal(available.length, count);
    assert.equal(new Set(available.map((row) => row.image_path)).size, count);
  }
});
