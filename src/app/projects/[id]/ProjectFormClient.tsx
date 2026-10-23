"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Credit,
  DEFAULT_FORM_DATA,
  Project,
  ProjectFormData,
  ProjectScreenshot,
  ProjectSection,
  ScreenshotLayout,
  ScreenshotRoleKey,
} from "@/lib/types";
import { publicUrlFor } from "@/lib/data";
import { Field } from "@/components/form/Field";
import { TagInput } from "@/components/form/TagInput";
import { CreditsEditor } from "@/components/form/CreditsEditor";
import { ScreenshotManager } from "@/components/form/ScreenshotManager";
import { AIPromptButton } from "@/components/form/AIPromptButton";
import { ProjectPreview } from "@/components/ProjectPreview";
import { Header } from "@/components/Header";
import type { ProjectMetadataImport } from "@/lib/project-json.mjs";

type Mode = "create" | "edit";

interface InitialData {
  project: Project;
  screenshots: ProjectScreenshot[];
}

interface Props {
  mode: Mode;
  initialData: InitialData | null;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const sectionOf = (raw: unknown, kicker: string): ProjectSection => {
  const s = (raw ?? {}) as Partial<ProjectSection>;
  return {
    body: s.body || "",
    title: s.title || "",
    kicker: s.kicker || kicker,
  };
};

export function ProjectFormClient({ mode, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormData>(() => {
    if (!initialData) return { ...DEFAULT_FORM_DATA };
    const p = initialData.project;
    const byType = (t: ProjectScreenshot["view_type"]) =>
      initialData.screenshots.find((s) => s.view_type === t) || null;

    const storedHeroPath = p.foto_storage_path;
    const heroPath = storedHeroPath?.startsWith("portfolio-proyek/")
      ? storedHeroPath.slice("portfolio-proyek/".length)
      : storedHeroPath;
    const mobileShots = initialData.screenshots
      .filter((s) => s.view_type === "mobile")
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, 3);
    const tablet = byType("tablet");
    const desktop = byType("desktop");
    const screenshotLayout: ScreenshotLayout =
      p.screenshot_layout === "mobile_only" ? "mobile_only" : "responsive";

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicOf = (path: string | null) =>
      path && base
        ? `${base}/storage/v1/object/public/portfolio-proyek/${path.split("/").map(encodeURIComponent).join("/")}`
        : null;

    return {
      name: p.name || "",
      slug: p.slug || "",
      description: p.description || "",
      date: p.date || "",
      project_type: p.project_type || "",
      timeframe: p.timeframe || "",
      hero_subtitle: p.hero_subtitle || "",
      project_context: p.project_context || "",
      team_quote: p.team_quote || "",
      seo_title: p.seo_title || "",
      seo_desc: p.seo_desc || "",
      link_web: p.link_web || "",
      repo_link: p.repo_link || "",
      source: p.source || "",
      frameworks: p.frameworks || [],
      brief: sectionOf(p.brief, "Brief"),
      challenge: sectionOf(p.challenge, "Challenge"),
      solution: sectionOf(p.solution, "Solution"),
      credits: p.credits && p.credits.length ? p.credits : [{ name: "", role: "" }],
      screenshotLayout,
      screenshots: { hero: null, mobile: null, mobile2: null, mobile3: null, tablet: null, desktop: null },
      screenshotPreviews: { hero: null, mobile: null, mobile2: null, mobile3: null, tablet: null, desktop: null },
      existingScreenshots: {
        hero: p.foto_public_url || publicOf(heroPath || null),
        mobile: publicOf(mobileShots[0]?.image_path || null),
        mobile2: publicOf(mobileShots[1]?.image_path || null),
        mobile3: publicOf(mobileShots[2]?.image_path || null),
        tablet: publicOf(tablet?.image_path || null),
        desktop: publicOf(desktop?.image_path || null),
      },
      existingScreenshotPaths: {
        hero: heroPath || null,
        mobile: mobileShots[0]?.image_path || null,
        mobile2: mobileShots[1]?.image_path || null,
        mobile3: mobileShots[2]?.image_path || null,
        tablet: tablet?.image_path || null,
        desktop: desktop?.image_path || null,
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
  });

  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [slugMessage, setSlugMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [user, setUser] = useState<{ email?: string | null } | null>(null);
  const [dirty, setDirty] = useState(false);
  const previewUrls = useRef<string[]>([]);

  // Track the signed-in user for the header.
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setUser(d.session?.user ?? null))
      .catch(() => {});
  }, []);

  // Release object URLs when the component unmounts.
  useEffect(() => {
    return () => {
      previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const update = useCallback(<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }, []);

  const setSection = (key: "brief" | "challenge" | "solution", patch: Partial<ProjectSection>) => {
    setForm((f) => ({ ...f, [key]: { ...f[key], ...patch } }));
    setDirty(true);
  };

  const setCredits = (credits: Credit[]) => {
    setForm((f) => ({ ...f, credits }));
    setDirty(true);
  };

  const applyProjectMetadata = (metadata: ProjectMetadataImport) => {
    setSlugTouched(true);
    setForm((current) => ({
      ...current,
      ...metadata,
      date:
        metadata.date === ""
          ? mode === "create" && current.date === DEFAULT_FORM_DATA.date
            ? ""
            : current.date
          : metadata.date ?? current.date,
      brief: { ...current.brief, ...metadata.brief },
      challenge: { ...current.challenge, ...metadata.challenge },
      solution: { ...current.solution, ...metadata.solution },
    }));
    setDirty(true);
  };

  // Auto-generate the slug from the name until the user edits it by hand.
  useEffect(() => {
    if (slugTouched) return;
    setForm((f) => ({ ...f, slug: slugify(f.name) }));
  }, [form.name, slugTouched]);

  // Validate the slug against the database whenever it changes.
  useEffect(() => {
    if (!form.slug) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      setSlugStatus("error");
      setSlugMessage("Use lowercase letters, numbers, and single hyphens only.");
      return;
    }
    if (form.slug.length > 100) {
      setSlugStatus("error");
      setSlugMessage("Slug is too long (max 100 characters).");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSlugStatus("checking");
      try {
        const res = await fetch("/api/validate-slug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: form.slug,
            excludeId: initialData?.project.id,
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.valid) {
          setSlugStatus("ok");
          setSlugMessage("");
        } else {
          setSlugStatus("error");
          setSlugMessage(data.error || "This slug cannot be used.");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSlugStatus("error");
          setSlugMessage("Could not verify the slug.");
        }
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [form.slug, initialData?.project.id]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleFileSelect = (role: ScreenshotRoleKey, file: File | null) => {
    setForm((f) => {
      const previews = { ...f.screenshotPreviews };
      if (f.screenshotPreviews[role]) {
        URL.revokeObjectURL(f.screenshotPreviews[role]!);
        previewUrls.current = previewUrls.current.filter((u) => u !== f.screenshotPreviews[role]);
      }
      if (file) {
        const url = URL.createObjectURL(file);
        previewUrls.current.push(url);
        previews[role] = url;
      } else {
        previews[role] = null;
      }
      return {
        ...f,
        screenshots: { ...f.screenshots, [role]: file },
        screenshotPreviews: previews,
        removedScreenshotRoles: { ...f.removedScreenshotRoles, [role]: false },
      };
    });
    setDirty(true);
  };

  const handleRemove = (role: ScreenshotRoleKey) => {
    setForm((f) => {
      const previews = { ...f.screenshotPreviews };
      if (f.screenshotPreviews[role]) {
        URL.revokeObjectURL(f.screenshotPreviews[role]!);
        previewUrls.current = previewUrls.current.filter((u) => u !== f.screenshotPreviews[role]);
        previews[role] = null;
      }
      return {
        ...f,
        screenshots: { ...f.screenshots, [role]: null },
        screenshotPreviews: previews,
        existingScreenshots: { ...f.existingScreenshots, [role]: null },
        removedScreenshotRoles: { ...f.removedScreenshotRoles, [role]: true },
      };
    });
    setDirty(true);
  };

  const previewImageUrls = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicOf = (path: string | null) =>
      path && base
        ? `${base}/storage/v1/object/public/portfolio-proyek/${path.split("/").map(encodeURIComponent).join("/")}`
        : null;
    return {
      hero: form.removedScreenshotRoles.hero ? null : form.screenshotPreviews.hero || form.existingScreenshots.hero,
      mobile: form.removedScreenshotRoles.mobile ? null : form.screenshotPreviews.mobile || form.existingScreenshots.mobile,
      mobile2: form.removedScreenshotRoles.mobile2 ? null : form.screenshotPreviews.mobile2 || form.existingScreenshots.mobile2,
      mobile3: form.removedScreenshotRoles.mobile3 ? null : form.screenshotPreviews.mobile3 || form.existingScreenshots.mobile3,
      tablet: form.removedScreenshotRoles.tablet ? null : form.screenshotPreviews.tablet || form.existingScreenshots.tablet,
      desktop: form.removedScreenshotRoles.desktop ? null : form.screenshotPreviews.desktop || form.existingScreenshots.desktop,
    };
  }, [form.screenshotPreviews, form.existingScreenshots, form.removedScreenshotRoles]);

  const previewProject = useMemo(
    () => ({
      name: form.name,
      description: form.description,
      date: form.date,
      project_type: form.project_type,
      timeframe: form.timeframe,
      hero_subtitle: form.hero_subtitle,
      project_context: form.project_context,
      team_quote: form.team_quote,
      link_web: form.link_web,
      repo_link: form.repo_link,
      source: form.source,
      frameworks: form.frameworks,
      brief: form.brief,
      challenge: form.challenge,
      solution: form.solution,
      credits: form.credits.filter((c) => c.name.trim()),
      foto_public_url: previewImageUrls.hero,
      screenshot_layout: form.screenshotLayout,
    }),
    [form, previewImageUrls]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }    if (form.screenshotLayout === "mobile_only" && !form.screenshots.hero && !form.existingScreenshots.hero) {
      setError("Hero Mobile is required for mobile-only projects.");
      return;
    }
    if (slugStatus === "error") {
      setError(slugMessage || "The slug is not valid.");
      return;
    }
    if (slugStatus === "checking") {
      setError("Wait for the slug check to finish.");
      return;
    }

    setSaving(true);

    const uploadedPaths: Partial<Record<ScreenshotRoleKey, string>> = {};

    try {
      // 1. Upload the newly chosen files first. Each gets a fresh name, so the
      //    objects the database still points at stay intact until step 3.
      const roles: ScreenshotRoleKey[] = ["hero", "mobile", "mobile2", "mobile3", "tablet", "desktop"];

      for (const role of roles) {
        const file = form.screenshots[role];
        if (!file) continue;

        const fd = new FormData();
        fd.append("file", file);
        fd.append("projectName", form.name.trim());
        fd.append("role", role);

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Could not upload the ${role} image`);
        }
        uploadedPaths[role] = data.path;
      }

      // 2. Work out the final path for every role. A role keeps its stored
      //    path unless a new file was chosen or the image was removed.
      const finalPath = (role: ScreenshotRoleKey) =>
        uploadedPaths[role] ??
        (form.removedScreenshotRoles[role] ? null : form.existingScreenshotPaths[role] ?? null);
      const finalPaths: Record<ScreenshotRoleKey, string | null> = {
        hero: finalPath("hero"),
        mobile: finalPath("mobile"),
        mobile2: finalPath("mobile2"),
        mobile3: finalPath("mobile3"),
        tablet: finalPath("tablet"),
        desktop: finalPath("desktop"),
      };
      const screenshotPaths: Partial<Record<ScreenshotRoleKey, string | null>> = { ...finalPaths };

      if (
        !finalPaths.hero &&
        !form.removedScreenshotRoles.hero &&
        form.existingScreenshots.hero
      ) {
        delete screenshotPaths.hero;
      }

      // 3. Create the record when this is a new project.
      const projectId = initialData?.project.id || (await createProjectRecord());

      // 4. Save the record and the screenshot references together.
      const saveRes = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: buildPayload(),
          screenshots: screenshotPaths,
          previous: form.existingScreenshotPaths,
        }),
      });
      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveData.error || "Could not save the project");
      }

      // 5. Confirm the new objects really exist in Storage.
      await verifyUploads(Object.values(uploadedPaths));

      setDirty(false);
      setSuccess(
        mode === "create"
          ? "Project created. The public site picks it up on its next data refresh."
          : "Project updated."
      );

      if (mode === "create") {
        router.push(`/projects/${projectId}`);
        router.refresh();
      } else {
        // Keep the stored paths in step with what was just written.
        setForm((f) => ({
          ...f,
          existingScreenshotPaths: finalPaths,
          existingScreenshots: {
            hero: finalPaths.hero
              ? publicUrlFor(finalPaths.hero)
              : form.removedScreenshotRoles.hero
                ? null
                : form.existingScreenshots.hero,
            mobile: finalPaths.mobile ? publicUrlFor(finalPaths.mobile) : null,
            mobile2: finalPaths.mobile2 ? publicUrlFor(finalPaths.mobile2) : null,
            mobile3: finalPaths.mobile3 ? publicUrlFor(finalPaths.mobile3) : null,
            tablet: finalPaths.tablet ? publicUrlFor(finalPaths.tablet) : null,
            desktop: finalPaths.desktop ? publicUrlFor(finalPaths.desktop) : null,
          },
          screenshotPreviews: {
            hero: null,
            mobile: null,
            mobile2: null,
            mobile3: null,
            tablet: null,
            desktop: null,
          },
          screenshots: { hero: null, mobile: null, mobile2: null, mobile3: null, tablet: null, desktop: null },
          removedScreenshotRoles: {
            hero: false,
            mobile: false,
            mobile2: false,
            mobile3: false,
            tablet: false,
            desktop: false,
          },
        }));
      }
    } catch (err) {
      const message = (err as Error).message || "Something went wrong while saving.";
      const cleanupFailures = await releaseUploads(Object.values(uploadedPaths));
      setError(
        cleanupFailures.length
          ? `${message} Some uploaded files could not be removed: ${cleanupFailures.map((path) => path.split("/").pop()).join(", ")}`
          : message
      );
    } finally {
      setSaving(false);
    }
  };

  const createProjectRecord = async (): Promise<string> => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        slug: form.slug.trim(),
        // The column is NOT NULL and the database only accepts these two values.
        source: form.source.trim() || "personal",
        created_time: new Date().toISOString(),
        updated_time: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create the project record");
    return data.project.id;
  };

  const buildPayload = (): Record<string, unknown> => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    date: form.date || null,
    project_type: form.project_type.trim() || null,
    timeframe: form.timeframe.trim() || null,
    hero_subtitle: form.hero_subtitle.trim() || null,
    project_context: form.project_context.trim() || null,
    team_quote: form.team_quote.trim() || null,
    seo_title: form.seo_title.trim() || null,
    seo_desc: form.seo_desc.trim() || null,
    link_web: form.link_web.trim() || null,
    repo_link: form.repo_link.trim() || null,
    source: form.source.trim() || "personal",
    frameworks: form.frameworks,
    brief: form.brief.body.trim() ? form.brief : null,
    challenge: form.challenge.body.trim() ? form.challenge : null,
    solution: form.solution.body.trim() ? form.solution : null,
    credits: form.credits.filter((c) => c.name.trim()),
    screenshot_layout: form.screenshotLayout,
    updated_time: new Date().toISOString(),
  });

  const verifyUploads = async (paths: string[]) => {
    if (!paths.length) return;
    const res = await fetch("/api/upload", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Uploaded files could not be verified in Storage");
    }
  };

  /**
   * Releases objects that were uploaded during a save attempt that then
   * failed. Only the paths from this attempt are touched.
   */
  const releaseUploads = async (paths: string[]): Promise<string[]> => {
    const failures: string[] = [];

    for (const path of paths) {
      if (!path) continue;
      try {
        const response = await fetch(
          `/api/upload?path=${encodeURIComponent(path)}&projectName=${encodeURIComponent(form.name.trim())}`,
          { method: "DELETE" }
        );
        if (!response.ok && response.status !== 409) {
          failures.push(path);
        }
      } catch {
        failures.push(path);
      }
    }

    return failures;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user ?? {}} />

      <main className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="btn-ghost px-2.5 py-2 text-sm"
                aria-label="Back to projects"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-black tracking-tight text-text">
                {mode === "create" ? "New project" : "Edit project"}
              </h1>
              {dirty && (
                <span className="badge-warning" style={{ background: "rgba(251,191,36,0.15)", borderColor: "rgba(251,191,36,0.3)", color: "#FBBF24" }}>
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="mt-1 text-text-muted ml-[3.25rem]">
              {mode === "create"
                ? "Add a project to the shared portfolio database."
                : "Changes appear on the public site after its next data refresh."}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="btn-secondary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              {showPreview ? "Hide preview" : "Preview"}
            </button>
            <button
              type="submit"
              form="project-form"
              disabled={saving}
              className="btn-primary"
            >
              {saving && (
                <span className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" aria-hidden="true" />
              )}
              {saving ? "Saving..." : mode === "create" ? "Create project" : "Save changes"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-danger/10 border border-danger/30 text-danger p-4 text-sm mb-6" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-success/10 border border-success/30 text-success p-4 text-sm mb-6" role="status">
            {success}
          </div>
        )}

        <div className={`grid min-w-0 gap-6 ${showPreview ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : "grid-cols-1"}`}>
          <form id="project-form" onSubmit={handleSubmit} className="min-w-0 space-y-6" noValidate>
            <AIPromptButton onImport={applyProjectMetadata} />

            {/* Basic information */}
            <section className="card space-y-5 p-4 sm:p-6">
              <h2 className="section-title">Basic information</h2>

              <Field
                label="Project name"
                htmlFor="name"
                required
                tooltip="The title shown on the landing page card, the project detail header, and the browser tab for that page. Example: &quot;GIS Surabaya Health&quot;. Required."
              >
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input"
                  placeholder="GIS Surabaya Health"
                  required
                />
              </Field>

              <Field
                label="Slug"
                htmlFor="slug"
                required
                hint="auto-generated"
                tooltip="Unique URL identifier for this project detail page. Use lowercase letters, numbers, and hyphens. Example: `gis-surabaya-health`. Must be unique across all projects. The public site reads the project at /work/<slug>."
              >
                <input
                  id="slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", e.target.value);
                  }}
                  className="input font-mono"
                  placeholder="gis-surabaya-health"
                  required
                />
                {slugStatus === "checking" && (
                  <p className="text-xs text-text-dim mt-1.5">Checking availability…</p>
                )}
                {slugStatus === "ok" && (
                  <p className="text-xs text-success mt-1.5">Slug is available.</p>
                )}
                {slugStatus === "error" && (
                  <p className="text-xs text-danger mt-1.5" role="alert">{slugMessage}</p>
                )}
              </Field>

              <Field
                label="Short description"
                htmlFor="description"
                tooltip="A one or two sentence summary of the project. Shown on the landing page card as the small caption under the title, and used as the fallback body text for the project overview section. Keep it under about 150 characters."
              >
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="textarea min-h-[80px]"
                  placeholder="A web map of health facilities across Surabaya with filterable categories and neighbourhood search."
                />
              </Field>

              <Field
                label="Hero subtitle"
                htmlFor="hero_subtitle"
                tooltip="A short tagline displayed in the project detail hero, next to the title. Unlike the short description, this is a punchier phrase rather than a sentence. Example: &quot;Find every clinic in one map&quot;."
              >
                <input
                  id="hero_subtitle"
                  type="text"
                  value={form.hero_subtitle}
                  onChange={(e) => update("hero_subtitle", e.target.value)}
                  className="input"
                  placeholder="Find every clinic in one map"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Category / project type"
                  htmlFor="project_type"
                  tooltip="The kind of project this is. Shown in the &quot;Service&quot; tile of the project detail page. Example: &quot;Web Application&quot;, &quot;Mobile App&quot;, &quot;Landing Page&quot;, &quot;API Service&quot;. Free text, but keeping it consistent helps the page read cleanly."
                >
                  <input
                    id="project_type"
                    type="text"
                    value={form.project_type}
                    onChange={(e) => update("project_type", e.target.value)}
                    className="input"
                    placeholder="Web Application"
                  />
                </Field>

                <Field
                  label="Project date"
                  htmlFor="date"
                  tooltip="The completion or release date. The portfolio shows only the year in the &quot;Year&quot; tile and sorts the landing page by this value, newest first. Use the format YYYY-MM-DD. Optional — leave empty if the project has no confirmed date."
                >
                  <input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className="input"
                  />
                </Field>

                <Field
                  label="Development period"
                  htmlFor="timeframe"
                  tooltip="The human-readable span of the work, shown in the &quot;Timeline&quot; tile. Example: &quot;21 April 2025 - 9 Juni 2026&quot; or &quot;2 weeks&quot;. Optional."
                >
                  <input
                    id="timeframe"
                    type="text"
                    value={form.timeframe}
                    onChange={(e) => update("timeframe", e.target.value)}
                    className="input"
                    placeholder="21 April 2025 - 9 June 2026"
                  />
                </Field>

                <Field
                  label="Client / context"
                  htmlFor="project_context"
                  tooltip="Who the project was for. Shown in the &quot;Client&quot; tile. Example: &quot;Proyek Akhir UKM Softdev 2025&quot;, &quot;Client: City Health Office&quot;, &quot;Personal project&quot;. Optional."
                >
                  <input
                    id="project_context"
                    type="text"
                    value={form.project_context}
                    onChange={(e) => update("project_context", e.target.value)}
                    className="input"
                    placeholder="Proyek Akhir UKM Softdev 2025"
                  />
                </Field>
              </div>

              <Field
                label="Origin"
                htmlFor="source"
                tooltip="Where the project came from. The database accepts only &quot;personal&quot; or &quot;kolaborasi&quot;. Used as a fallback for the &quot;Client&quot; tile when no client is set."
              >
                <select
                  id="source"
                  value={form.source}
                  onChange={(e) => update("source", e.target.value)}
                  className="input"
                >
                  <option value="">Select an origin</option>
                  <option value="personal">personal</option>
                  <option value="kolaborasi">kolaborasi</option>
                </select>
              </Field>
            </section>

            {/* Technical information */}
            <section className="card space-y-5 p-4 sm:p-6">
              <h2 className="section-title">Technical information</h2>

              <Field
                label="Technologies & frameworks"
                tooltip="The tools and libraries used. Each one renders as a chip in the &quot;Stack&quot; row of the project detail page. Use the names people would recognise, e.g. &quot;React&quot;, &quot;Tailwind CSS&quot;, &quot;Supabase&quot;. Press Enter to add each tag."
              >
                <TagInput value={form.frameworks} onChange={(v) => update("frameworks", v)} />
              </Field>

              <Field
                label="Team & roles"
                tooltip="The people who worked on the project and what they did. Rendered in the sticky &quot;Credits&quot; panel next to the project overview, with the role in small caps. Leave the rows blank if the project was solo — an empty credits list hides the whole panel."
              >
                <CreditsEditor value={form.credits} onChange={setCredits} />
              </Field>

              <Field
                label="Team quote"
                htmlFor="team_quote"
                tooltip="An optional testimonial or closing statement, shown inside the credits panel and truncated at 320 characters. Example: &quot;This project was designed and developed collaboratively, combining mental-health research, empathetic interaction design, and front-end engineering.&quot; Leave empty to hide it."
              >
                <textarea
                  id="team_quote"
                  value={form.team_quote}
                  onChange={(e) => update("team_quote", e.target.value)}
                  className="textarea min-h-[90px]"
                  placeholder="A closing statement from the team about the project's intent and process."
                />
              </Field>

              {(["brief", "challenge", "solution"] as const).map((key) => (
                <div key={key} className="space-y-3 rounded-xl border border-border p-4">
                  <p className="text-sm font-semibold text-text">
                    {key === "brief" ? "Project overview" : key === "challenge" ? "Project process" : "Final result"}
                  </p>
                  <Field
                    label="Section title"
                    htmlFor={`${key}-title`}
                    tooltip={`A short headline for this section. Example for the ${key}: ${key === "brief" ? "\"Build a safe emotional support platform\"" : key === "challenge" ? "\"Mental health feels distant and judgemental\"" : "\"Mood tracker, mentor, and forum in one flow\""}. Optional — the body works on its own.`}
                  >
                    <input
                      id={`${key}-title`}
                      type="text"
                      value={form[key].title}
                      onChange={(e) => setSection(key, { title: e.target.value })}
                      className="input"
                    />
                  </Field>
                  <Field
                    label="Section body"
                    htmlFor={`${key}-body`}
                    tooltip={`The main copy for this section. The ${key} section renders as a heading plus one long paragraph. Write in plain, professional English. Leave empty to hide the section entirely.`}
                  >
                    <textarea
                      id={`${key}-body`}
                      value={form[key].body}
                      onChange={(e) => setSection(key, { body: e.target.value })}
                      className="textarea min-h-[120px]"
                    />
                  </Field>
                </div>
              ))}
            </section>

            {/* Links */}
            <section className="card space-y-5 p-4 sm:p-6">
              <h2 className="section-title">Links</h2>

              <Field
                label="Live project URL"
                htmlFor="link_web"
                tooltip="The address of the deployed site. The project detail page shows a &quot;Visit Live Site&quot; button that opens this in a new tab. Must be a full https:// address. Optional — when empty, the page shows a &quot;Contact me&quot; button instead."
              >
                <input
                  id="link_web"
                  type="url"
                  value={form.link_web}
                  onChange={(e) => update("link_web", e.target.value)}
                  className="input"
                  placeholder="https://example.vercel.app"
                />
              </Field>

              <Field
                label="GitHub repository URL"
                htmlFor="repo_link"
                tooltip="The address of the source repository. The project detail page shows a &quot;View Repository&quot; button that opens this in a new tab. Must be a full https:// address. Only paste a link that actually exists — do not construct one from the project name. Optional."
              >
                <input
                  id="repo_link"
                  type="url"
                  value={form.repo_link}
                  onChange={(e) => update("repo_link", e.target.value)}
                  className="input"
                  placeholder="https://github.com/owner/repository"
                />
              </Field>
            </section>

            {/* Search metadata */}
            <section className="card space-y-5 p-4 sm:p-6">
              <h2 className="section-title">Search metadata</h2>
              <Field
                label="SEO title"
                htmlFor="seo_title"
                tooltip="Optional title used by search engines and social previews. Leave empty to use the project name."
              >
                <input
                  id="seo_title"
                  type="text"
                  value={form.seo_title}
                  onChange={(e) => update("seo_title", e.target.value)}
                  className="input"
                  placeholder="Project name"
                />
              </Field>
              <Field
                label="SEO description"
                htmlFor="seo_desc"
                tooltip="Optional search-result and social-preview description. Keep it concise, up to about 160 characters."
              >
                <textarea
                  id="seo_desc"
                  value={form.seo_desc}
                  onChange={(e) => update("seo_desc", e.target.value)}
                  className="textarea min-h-[80px]"
                  placeholder="A concise description of the project."
                />
              </Field>
            </section>

            {/* Screenshots */}
            <section className="card space-y-5 p-4 sm:p-6">
              <h2 className="section-title">Screenshots</h2>
              <p className="text-sm text-text-muted -mt-1">
                Choose the screenshot roles that match this project. Optional screenshots can be left empty.
              </p>
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-text">Screenshot configuration</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    {
                      value: "responsive",
                      label: "Responsive / Multi-device",
                      description: "Hero, mobile, tablet, and desktop screenshots.",
                    },
                    {
                      value: "mobile_only",
                      label: "Mobile-only",
                      description: "A mobile hero with up to three additional mobile screenshots.",
                    },
                  ] as const).map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                        form.screenshotLayout === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-white/[0.02] hover:border-border-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name="screenshot-layout"
                        value={option.value}
                        checked={form.screenshotLayout === option.value}
                        onChange={() => update("screenshotLayout", option.value)}
                        disabled={saving}
                        className="mt-1 accent-primary"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-text">{option.label}</span>
                        <span className="mt-1 block text-xs text-text-dim">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-text-dim">
                  Switching configurations only changes which controls are shown. Existing screenshots stay saved and are not deleted.
                </p>
              </fieldset>
              <ScreenshotManager
                files={form.screenshots}
                previews={form.screenshotPreviews}
                existingUrls={form.existingScreenshots}
                existingPaths={form.existingScreenshotPaths}
                layout={form.screenshotLayout}
                onFileSelect={handleFileSelect}
                onRemove={handleRemove}
                disabled={saving}
              />
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="btn-secondary"
              >
                Kembali ke atas
              </button>
            </div>
          </form>

          {showPreview && (
            <div className="order-first h-fit min-w-0 max-h-[calc(100vh-7rem)] min-h-0 overflow-y-auto overscroll-contain lg:sticky lg:top-24 lg:order-none">
              <ProjectPreview project={previewProject} screenshots={previewImageUrls} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
