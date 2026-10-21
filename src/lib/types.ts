export interface Project {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  foto_file_name: string | null;
  foto_storage_path: string | null;
  foto_public_url: string | null;
  link_web: string | null;
  repo_link: string | null;
  source: string | null;
  created_time: string;
  updated_time: string;
  frameworks: string[] | null;
  hero_subtitle: string | null;
  project_type: string | null;
  timeframe: string | null;
  brief: ProjectSection | null;
  challenge: ProjectSection | null;
  solution: ProjectSection | null;
  credits: Credit[] | null;
  gallery: GalleryItem[] | null;
  slug: string | null;
  seo_title: string | null;
  seo_desc: string | null;
  project_context: string | null;
  team_quote: string | null;
}

export interface ProjectSection {
  body: string;
  title: string;
  kicker?: string;
}

export interface Credit {
  name: string;
  role: string;
}

export interface GalleryItem {
  url: string;
  type: "phone" | "tablet" | "desktop";
  alt_text: string;
  sort_order: number;
  storage_path: string;
}

export interface ProjectScreenshot {
  id: string;
  project_id: string;
  image_path: string;
  view_type: "mobile" | "tablet" | "desktop";
  sort_order: number;
  alt_text: string | null;
  created_at: string;
}

export interface ProjectFormData {
  name: string;
  slug: string;
  description: string;
  date: string;
  project_type: string;
  timeframe: string;
  hero_subtitle: string;
  project_context: string;
  team_quote: string;
  link_web: string;
  repo_link: string;
  source: string;
  frameworks: string[];
  brief: ProjectSection;
  challenge: ProjectSection;
  solution: ProjectSection;
  credits: Credit[];
  screenshots: {
    hero: File | null;
    mobile: File | null;
    tablet: File | null;
    desktop: File | null;
  };
  screenshotPreviews: {
    hero: string | null;
    mobile: string | null;
    tablet: string | null;
    desktop: string | null;
  };
  existingScreenshots: {
    hero: string | null;
    mobile: string | null;
    tablet: string | null;
    desktop: string | null;
  };
  existingScreenshotPaths: {
    hero: string | null;
    mobile: string | null;
    tablet: string | null;
    desktop: string | null;
  };
}

export const DEFAULT_FORM_DATA: ProjectFormData = {
  name: "",
  slug: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  project_type: "",
  timeframe: "",
  hero_subtitle: "",
  project_context: "",
  team_quote: "",
  link_web: "",
  repo_link: "",
  source: "",
  frameworks: [],
  brief: { body: "", title: "", kicker: "Brief" },
  challenge: { body: "", title: "", kicker: "Challenge" },
  solution: { body: "", title: "", kicker: "Solution" },
  credits: [{ name: "", role: "" }],
  screenshots: {
    hero: null,
    mobile: null,
    tablet: null,
    desktop: null,
  },
  screenshotPreviews: {
    hero: null,
    mobile: null,
    tablet: null,
    desktop: null,
  },
  existingScreenshots: {
    hero: null,
    mobile: null,
    tablet: null,
    desktop: null,
  },
  existingScreenshotPaths: {
    hero: null,
    mobile: null,
    tablet: null,
    desktop: null,
  },
};

export const VIEW_TYPE_LABELS: Record<ProjectScreenshot["view_type"], string> = {
  mobile: "Mobile",
  tablet: "Tablet",
  desktop: "Desktop Additional",
};

export const VIEW_TYPE_DESCRIPTIONS: Record<ProjectScreenshot["view_type"], string> = {
  mobile: "A portrait screenshot used in the smartphone showcase. Upload the actual mobile interface rather than cropping a desktop screenshot.",
  tablet: "A screenshot intended for the tablet frame. Use a genuine tablet layout or an appropriate responsive tablet view.",
  desktop: "A secondary desktop screenshot displayed below the mobile/tablet showcase. Choose another useful screen or feature and preserve its natural aspect ratio.",
};

export const SCREENSHOT_ROLES = [
  { key: "hero", label: "Hero Desktop", description: "The primary image shown in the project detail hero. Choose a clear desktop screenshot representing the project. This is separate from the additional desktop screenshot below the device showcase.", accept: "image/*" },
  { key: "mobile", label: "Mobile", description: "A portrait screenshot used in the smartphone showcase. Upload the actual mobile interface rather than cropping a desktop screenshot.", accept: "image/*" },
  { key: "tablet", label: "Tablet", description: "A screenshot intended for the tablet frame. Use a genuine tablet layout or an appropriate responsive tablet view.", accept: "image/*" },
  { key: "desktop", label: "Desktop Additional", description: "A secondary desktop screenshot displayed below the mobile/tablet showcase. Choose another useful screen or feature and preserve its natural aspect ratio.", accept: "image/*" },
] as const;

export type ScreenshotRoleKey = (typeof SCREENSHOT_ROLES)[number]["key"];