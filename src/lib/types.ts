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
  screenshot_layout: ScreenshotLayout | null;
}

export interface PortfolioTool {
  tool_id: number;
  name: string;
  short_desc: string | null;
  category: string | null;
  logo_file_name: string | null;
  logo_storage_path: string | null;
  logo_public_url: string | null;
}

export type ScreenshotLayout = "responsive" | "mobile_only";

export interface ProjectSection {
  body: string;
  title: string;
  kicker?: string;
}

export interface Credit {
  name: string;
  role: string;
}

export interface ProjectMetadataImport {
  name?: string;
  slug?: string;
  description?: string;
  date?: string;
  project_type?: string;
  timeframe?: string;
  hero_subtitle?: string;
  project_context?: string;
  team_quote?: string;
  seo_title?: string;
  seo_desc?: string;
  link_web?: string;
  repo_link?: string;
  source?: string;
  frameworks?: string[];
  brief?: Partial<ProjectSection>;
  challenge?: Partial<ProjectSection>;
  solution?: Partial<ProjectSection>;
  credits?: Credit[];
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
  seo_title: string;
  seo_desc: string;
  link_web: string;
  repo_link: string;
  source: string;
  frameworks: string[];
  brief: ProjectSection;
  challenge: ProjectSection;
  solution: ProjectSection;
  credits: Credit[];
  screenshotLayout: ScreenshotLayout;
  screenshots: {
    hero: File | null;
    mobile: File | null;
    mobile2: File | null;
    mobile3: File | null;
    tablet: File | null;
    desktop: File | null;
  };
  screenshotPreviews: {
    hero: string | null;
    mobile: string | null;
    mobile2: string | null;
    mobile3: string | null;
    tablet: string | null;
    desktop: string | null;
  };
  existingScreenshots: {
    hero: string | null;
    mobile: string | null;
    mobile2: string | null;
    mobile3: string | null;
    tablet: string | null;
    desktop: string | null;
  };
  existingScreenshotPaths: {
    hero: string | null;
    mobile: string | null;
    mobile2: string | null;
    mobile3: string | null;
    tablet: string | null;
    desktop: string | null;
  };
  removedScreenshotRoles: Record<ScreenshotRoleKey, boolean>;
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
  seo_title: "",
  seo_desc: "",
  link_web: "",
  repo_link: "",
  source: "",
  frameworks: [],
  brief: { body: "", title: "", kicker: "Brief" },
  challenge: { body: "", title: "", kicker: "Challenge" },
  solution: { body: "", title: "", kicker: "Solution" },
  credits: [{ name: "", role: "" }],
  screenshotLayout: "responsive",
  screenshots: {
    hero: null,
    mobile: null,
    mobile2: null,
    mobile3: null,
    tablet: null,
    desktop: null,
  },
  screenshotPreviews: {
    hero: null,
    mobile: null,
    mobile2: null,
    mobile3: null,
    tablet: null,
    desktop: null,
  },
  existingScreenshots: {
    hero: null,
    mobile: null,
    mobile2: null,
    mobile3: null,
    tablet: null,
    desktop: null,
  },
  existingScreenshotPaths: {
    hero: null,
    mobile: null,
    mobile2: null,
    mobile3: null,
    tablet: null,
    desktop: null,
  },
  removedScreenshotRoles: {
    hero: false,
    mobile: false,
    mobile2: false,
    mobile3: false,
    tablet: false,
    desktop: false,
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
  { key: "hero", label: "Hero Desktop", mobileLabel: "Hero Mobile", description: "The primary image shown in the project detail hero.", accept: "image/*" },
  { key: "mobile", label: "Mobile", mobileLabel: "Mobile Screenshot 2", description: "A mobile interface screenshot used in the smartphone showcase.", accept: "image/*" },
  { key: "mobile2", label: "Additional Mobile Screenshot 2", mobileLabel: "Mobile Screenshot 3", description: "A second mobile interface screen showing a distinct supporting feature.", accept: "image/*" },
  { key: "mobile3", label: "Additional Mobile Screenshot 3", mobileLabel: "Mobile Screenshot 4", description: "A third mobile interface screen showing another distinct feature.", accept: "image/*" },
  { key: "tablet", label: "Tablet", mobileLabel: "Tablet", description: "A genuine tablet layout or an appropriate responsive tablet view.", accept: "image/*" },
  { key: "desktop", label: "Desktop Additional", mobileLabel: "Desktop Additional", description: "A secondary desktop screenshot shown below the device showcase.", accept: "image/*" },
] as const;

export type ScreenshotRoleKey = (typeof SCREENSHOT_ROLES)[number]["key"];
export type ScreenshotGalleryRole = Exclude<ScreenshotRoleKey, "hero">;
