import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Parse .env.local manually without dotenv dependency
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const TOOLS_BUCKET = "portfolio-tools";

interface ToolItem {
  name: string;
  category: string;
  short_desc: string;
  sourceUrl?: string;
  svgContent?: string;
}

const toolsToAdd: ToolItem[] = [
  {
    name: "Laravel",
    category: "Backend",
    short_desc: "Framework PHP untuk pengembangan web",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
  },
  {
    name: "Node.js",
    category: "Backend",
    short_desc: "Runtime JavaScript sisi server yang cepat dan scalable",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    name: "MySQL",
    category: "Database",
    short_desc: "Sistem manajemen database relasional SQL",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  {
    name: "MongoDB",
    category: "Database",
    short_desc: "Database NoSQL berbasis dokumen berkinerja tinggi",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  {
    name: "Swagger",
    category: "API Documentation",
    short_desc: "Alat dokumentasi dan desain spesifikasi REST API",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swagger/swagger-original.svg",
  },
  {
    name: "Git",
    category: "Version Control",
    short_desc: "Sistem version control terdistribusi untuk pelacakan kode",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  },
  {
    name: "Vue.js",
    category: "Frontend",
    short_desc: "Framework JavaScript progresif untuk antarmuka pengguna",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  },
  {
    name: "Blade",
    category: "Templating Engine",
    short_desc: "Mesin templating bawaan Laravel yang simpel dan bertenaga",
    sourceUrl: "https://raw.githubusercontent.com/blade-ui-kit/art/main/logo.svg",
  },
  {
    name: "TypeScript",
    category: "Programming Language",
    short_desc: "Superset JavaScript dengan pengetikan statis yang kuat",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    name: "Claude",
    category: "AI",
    short_desc: "Model kecerdasan buatan dari Anthropic untuk asistensi pemrograman",
    sourceUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/claude/claude-original.svg",
  },
  {
    name: "Antigravity",
    category: "AI",
    short_desc: "AI coding assistant canggih dari Google DeepMind",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="orbit1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="orbit2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <linearGradient id="coreG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <ellipse cx="256" cy="256" rx="170" ry="70" fill="none" stroke="url(#orbit1)" stroke-width="14" stroke-linecap="round" transform="rotate(-35 256 256)" opacity="0.85"/>
  <ellipse cx="256" cy="256" rx="170" ry="70" fill="none" stroke="url(#orbit2)" stroke-width="14" stroke-linecap="round" transform="rotate(35 256 256)" opacity="0.85"/>
  <circle cx="140" cy="140" r="14" fill="#38bdf8" filter="url(#glow)"/>
  <circle cx="372" cy="372" r="14" fill="#ec4899" filter="url(#glow)"/>
  <circle cx="360" cy="150" r="10" fill="#a855f7" filter="url(#glow)"/>
  <circle cx="152" cy="362" r="10" fill="#6366f1" filter="url(#glow)"/>
  <circle cx="256" cy="256" r="68" fill="url(#coreG)" filter="url(#glow)"/>
  <path d="M256 200 L292 278 L256 266 L220 278 Z" fill="#ffffff" opacity="0.95"/>
</svg>`,
  },
];

const fileSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  console.log("Checking existing tools in Supabase...");
  const { data: existingTools, error: listError } = await supabase
    .from("tools")
    .select("tool_id,name,category,logo_public_url");

  if (listError) {
    console.error("Failed to query tools table:", listError);
    process.exit(1);
  }

  const existingMap = new Map(existingTools?.map((t) => [t.name.toLowerCase(), t]));

  for (const item of toolsToAdd) {
    console.log(`\n========================================`);
    console.log(`Processing tool: ${item.name} (${item.category})`);

    const existing = existingMap.get(item.name.toLowerCase());
    if (existing) {
      console.log(`Tool "${item.name}" already exists with tool_id=${existing.tool_id}. Skipping.`);
      continue;
    }

    let rawBuffer: Buffer;
    if (item.sourceUrl) {
      console.log(`Fetching SVG from ${item.sourceUrl}...`);
      const res = await fetch(item.sourceUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${item.sourceUrl}: HTTP ${res.status}`);
      }
      rawBuffer = Buffer.from(await res.arrayBuffer());
    } else if (item.svgContent) {
      rawBuffer = Buffer.from(item.svgContent);
    } else {
      throw new Error(`No image source provided for ${item.name}`);
    }

    console.log(`Compressing and converting image to WebP with Sharp...`);
    const compressedWebp = await sharp(rawBuffer, { density: 300 })
      .resize({
        width: 512,
        height: 512,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    console.log(`Compressed size: ${(compressedWebp.info.size / 1024).toFixed(2)} KB (original was ${(rawBuffer.length / 1024).toFixed(2)} KB)`);

    const safeFolderName = item.name
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
      .replace(/\s+/g, " ")
      .slice(0, 80);
    const fileName = `${fileSlug(item.name) || "tool"}-${crypto.randomUUID().slice(0, 8)}.webp`;
    const storageKey = `Tools/${safeFolderName}/logo/${fileName}`;
    const storedPath = `${TOOLS_BUCKET}/${storageKey}`;

    console.log(`Uploading to Supabase Storage: ${storedPath}...`);
    const { error: uploadError } = await supabase.storage
      .from(TOOLS_BUCKET)
      .upload(storageKey, compressedWebp.data, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error(`Failed to upload ${item.name}:`, uploadError);
      continue;
    }

    const { data: publicData } = supabase.storage
      .from(TOOLS_BUCKET)
      .getPublicUrl(storageKey);

    const logoPublicUrl = publicData.publicUrl;
    console.log(`Public URL: ${logoPublicUrl}`);

    const timestamp = new Date().toISOString();
    console.log(`Inserting tool row into "tools" table...`);
    const { data: inserted, error: insertError } = await supabase
      .from("tools")
      .insert({
        id: crypto.randomUUID(),
        name: item.name,
        short_desc: item.short_desc,
        category: item.category,
        logo_file_name: fileName,
        logo_storage_path: storedPath,
        logo_public_url: logoPublicUrl,
        created_time: timestamp,
        updated_time: timestamp,
      })
      .select("tool_id,name,category,short_desc,logo_public_url")
      .single();

    if (insertError) {
      console.error(`Insert error for ${item.name}:`, insertError);
    } else {
      console.log(`SUCCESS! Tool added with tool_id=${inserted.tool_id}: ${inserted.name}`);
    }
  }

  console.log(`\n========================================`);
  console.log("All tools processed successfully!");
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
