import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prompt = `You are helping me prepare accurate project metadata for my portfolio CMS.
I will provide you with information about a project (source code, documentation, screenshots, descriptions, live links, repository links, etc.).
Your task is to generate a JSON object that matches the exact schema below, using ONLY information you can verify from the sources I provide.

## STRICT RULES
1. DO NOT invent features, technologies, team members, quotes, metrics, dates, or URLs.
2. If a value is unknown or cannot be verified, use an empty string "" for strings, [] for arrays, or null for objects.
3. Use concise, professional English copy consistent with a developer portfolio.
4. All dates must be in YYYY-MM-DD format.
5. The "slug" must be lowercase, alphanumeric with hyphens only (e.g., "my-project-name").
6. Image files must be selected and uploaded separately through the CMS; do NOT fabricate Storage URLs or paths.
7. Never include API keys, tokens, or environment variables in your answer.

## JSON SCHEMA
{
  "name": "string (required, project display name)",
  "slug": "string (required, unique URL identifier, lowercase with hyphens)",
  "description": "string (short description, 1-2 sentences)",
  "date": "string (YYYY-MM-DD, project completion/release date)",
  "project_type": "string (category, e.g., 'Web Application', 'Mobile App', 'API', 'Landing Page')",
  "timeframe": "string (e.g., 'Jan 2024 - Mar 2024' or '3 months')",
  "hero_subtitle": "string (short tagline shown in hero, max ~100 chars)",
  "project_context": "string (client, course, hackathon, personal, etc.)",
  "team_quote": "string (optional, testimonial/quote from team member, max ~320 chars)",
  "link_web": "string (live project URL, must be valid https://)",
  "repo_link": "string (GitHub/GitLab repository URL, must be valid https://)",
  "source": "string (origin: 'personal', 'kolaborasi', 'freelance', 'coursework', etc.)",
  "frameworks": "string[] (technologies used, e.g., ['React', 'Next.js', 'Tailwind CSS', 'Supabase'])",
  "brief": {
    "body": "string (project overview: what it is, who it's for, core value proposition)",
    "title": "string (section kicker, e.g., 'Build a safe emotional support platform')",
    "kicker": "Brief"
  },
  "challenge": {
    "body": "string (what problem you solved, constraints, difficulties)",
    "title": "string (section kicker, e.g., 'Mental health feels distant and judgemental')",
    "kicker": "Challenge"
  },
  "solution": {
    "body": "string (how you solved it: architecture, key features, technical approach)",
    "title": "string (section kicker, e.g., 'Mood tracker, mentor, and forum in one flow')",
    "kicker": "Solution"
  },
  "credits": [
    { "name": "string", "role": "string" }
  ],
  "seo_title": "string (optional, defaults to name)",
  "seo_desc": "string (optional, meta description, max ~160 chars)"
}

## SCREENSHOT ROLES (for reference - files uploaded separately)
1. **Hero Desktop** — Primary hero image, desktop screenshot representing the project.
2. **Mobile** — Portrait mobile screenshot for the smartphone device frame.
3. **Tablet** — Tablet screenshot for the tablet device frame.
4. **Desktop Additional** — Secondary desktop screenshot shown below the device showcase.

## EXISTING TECHNOLOGY OPTIONS (use when applicable, add others as needed)
Frontend: React, Next.js, Vue, Nuxt, Svelte, TypeScript, JavaScript, Tailwind CSS, CSS Modules, Styled Components, Framer Motion, GSAP, Three.js, React Three Fiber
Backend: Node.js, Express, Fastify, NestJS, Python, Django, FastAPI, Go, Rust, Supabase, Firebase, PostgreSQL, MongoDB, Prisma, Drizzle ORM
Mobile: React Native, Expo, Flutter, Dart, Swift, Kotlin
Tools: Git, GitHub Actions, Vercel, Netlify, Docker, Kubernetes, ESLint, Prettier, Jest, Vitest, Playwright, Storybook

## OUTPUT
Return ONLY the JSON object. No markdown, no explanations, no extra text.`;

  return NextResponse.json({ prompt });
}
