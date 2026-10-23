import assert from "node:assert/strict";
import test from "node:test";
import { parseProjectJson } from "../../src/lib/project-json.mjs";

test("parses project metadata and nested sections from the prompt schema", () => {
  const result = parseProjectJson(JSON.stringify({
    name: "Portfolio project",
    slug: "portfolio-project",
    frameworks: ["Next.js", "TypeScript"],
    brief: { body: "Overview", title: "A useful project", kicker: "Brief" },
    credits: [{ name: "Rizal", role: "Developer" }],
  }));

  assert.deepEqual(result, {
    data: {
      name: "Portfolio project",
      slug: "portfolio-project",
      frameworks: ["Next.js", "TypeScript"],
      brief: { body: "Overview", title: "A useful project", kicker: "Brief" },
      credits: [{ name: "Rizal", role: "Developer" }],
    },
  });
});

test("rejects malformed JSON, non-object values, and missing required fields", () => {
  assert.match(parseProjectJson("{").error, /valid JSON object/);
  assert.match(parseProjectJson("[]").error, /must be an object/);
  assert.match(parseProjectJson('{"name":"Project"}').error, /slug is required/);
});

test("rejects invalid dates, URLs, origins, and field types", () => {
  const valid = { name: "Project", slug: "project" };
  assert.match(parseProjectJson(JSON.stringify({ ...valid, date: "2026-02-30" })).error, /real date/);
  assert.match(parseProjectJson(JSON.stringify({ ...valid, link_web: "http://example.com" })).error, /https/);
  assert.match(parseProjectJson(JSON.stringify({ ...valid, source: "freelance" })).error, /personal or kolaborasi/);
  assert.match(parseProjectJson(JSON.stringify({ ...valid, frameworks: "React" })).error, /array of strings/);
});

test("omits blank optional values so applying JSON does not clear existing data", () => {
  const result = parseProjectJson(JSON.stringify({
    name: "Project",
    slug: "project",
    description: "",
    frameworks: [],
    brief: { body: "", title: "" },
    credits: [],
  }));

  assert.deepEqual(result, { data: { name: "Project", slug: "project" } });
});

test("keeps an explicit blank date so a new project's default date can be cleared", () => {
  const result = parseProjectJson(JSON.stringify({
    name: "Project",
    slug: "project",
    date: "",
  }));

  assert.deepEqual(result, { data: { name: "Project", slug: "project", date: "" } });
});
