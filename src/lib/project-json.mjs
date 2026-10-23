/**
 * @typedef {import("./types").ProjectMetadataImport} ProjectMetadataImport
 * @typedef {{ data: ProjectMetadataImport; error?: never } | { error: string; data?: never }} ParseResult
 */

const TEXT_FIELDS = [
  "name",
  "slug",
  "description",
  "date",
  "project_type",
  "timeframe",
  "hero_subtitle",
  "project_context",
  "team_quote",
  "link_web",
  "repo_link",
  "source",
  "seo_title",
  "seo_desc",
];

const SECTION_FIELDS = ["brief", "challenge", "solution"];

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};

const parseHttpsUrl = (value, field) => {
  if (!value) return null;
  try {
    if (new URL(value).protocol === "https:") return null;
  } catch {
    // Report malformed URLs with the same actionable message.
  }
  return `${field} must be a valid https:// URL.`;
};

/**
 * Parse and validate project metadata from the AI prompt's JSON schema.
 * Empty values are omitted so applying an answer never erases existing form data.
 * @param {string} text
 * @returns {ParseResult}
 */
export function parseProjectJson(text) {
  let input;
  try {
    input = JSON.parse(text);
  } catch {
    return { error: "Enter a valid JSON object." };
  }

  if (!isRecord(input)) {
    return { error: "The JSON response must be an object." };
  }

  /** @type {ProjectMetadataImport} */
  const data = {};

  for (const field of TEXT_FIELDS) {
    if (!(field in input) || input[field] === null) continue;
    if (typeof input[field] !== "string") {
      return { error: `${field} must be a string.` };
    }
    const value = input[field].trim();
    if (field === "date" && !value) {
      data.date = "";
      continue;
    }
    if (value) data[field] = value;
  }

  if (!data.name) {
    return { error: "name is required and cannot be empty." };
  }
  if (!data.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    return { error: "slug is required and must use lowercase letters, numbers, and single hyphens." };
  }
  if (data.date && !isValidDate(data.date)) {
    return { error: "date must be a real date in YYYY-MM-DD format." };
  }
  for (const field of ["link_web", "repo_link"]) {
    const error = parseHttpsUrl(data[field], field);
    if (error) return { error };
  }
  if (data.source && data.source !== "personal" && data.source !== "kolaborasi") {
    return { error: "source must be either personal or kolaborasi." };
  }

  if ("frameworks" in input && input.frameworks !== null) {
    if (!Array.isArray(input.frameworks) || !input.frameworks.every((item) => typeof item === "string")) {
      return { error: "frameworks must be an array of strings." };
    }
    const frameworks = input.frameworks.map((item) => item.trim()).filter(Boolean);
    if (frameworks.length) data.frameworks = frameworks;
  }

  for (const field of SECTION_FIELDS) {
    if (!(field in input) || input[field] === null) continue;
    if (!isRecord(input[field])) {
      return { error: `${field} must be an object or null.` };
    }
    const section = {};
    for (const sectionField of ["body", "title", "kicker"]) {
      if (!(sectionField in input[field]) || input[field][sectionField] === null) continue;
      if (typeof input[field][sectionField] !== "string") {
        return { error: `${field}.${sectionField} must be a string.` };
      }
      const value = input[field][sectionField].trim();
      if (value) section[sectionField] = value;
    }
    if (Object.keys(section).length) data[field] = section;
  }

  if ("credits" in input && input.credits !== null) {
    if (
      !Array.isArray(input.credits) ||
      !input.credits.every(
        (credit) =>
          isRecord(credit) &&
          typeof credit.name === "string" &&
          typeof credit.role === "string"
      )
    ) {
      return { error: "credits must be an array of objects with string name and role values." };
    }
    const credits = input.credits
      .map((credit) => ({ name: credit.name.trim(), role: credit.role.trim() }))
      .filter((credit) => credit.name || credit.role);
    if (credits.length) data.credits = credits;
  }

  return { data };
}
