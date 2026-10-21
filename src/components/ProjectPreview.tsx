"use client";

import { Project, ProjectScreenshot, VIEW_TYPE_LABELS } from "@/lib/types";

interface ProjectPreviewProps {
  project: Partial<Project> & Record<string, unknown>;
  screenshots: Record<string, string | null>;
}

/**
 * Mirrors the public portfolio's project detail page: the hero block, the
 * metadata strip, the stack chips, the brief/challenge/solution trio, and the
 * device showcase. Optional blocks are omitted when their data is missing,
 * the same way the portfolio omits them.
 */
export function ProjectPreview({ project, screenshots }: ProjectPreviewProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const frameworks = project.frameworks || [];
  const credits = project.credits || [];
  const hasCredits = credits.length > 0;
  const teamQuote = project.team_quote || "";
  const year = project.date ? new Date(project.date).getFullYear() : "—";

  const sections = [
    { key: "brief", label: "Project overview", data: project.brief },
    { key: "challenge", label: "Project process", data: project.challenge },
    { key: "solution", label: "Final result", data: project.solution },
  ].filter((s) => s.data?.body);

  const deviceScreens = (
    [
      { key: "mobile", label: "Mobile", image: screenshots.mobile },
      { key: "tablet", label: "Tablet", image: screenshots.tablet },
    ] as { key: "mobile" | "tablet"; label: string; image: string | null }[]
  ).filter((s) => s.image);

  return (
    <div className="rounded-2xl border border-border bg-[#0A0404] overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-white/[0.03] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-warning" aria-hidden="true" />
        <span className="text-xs font-mono tracking-wider uppercase text-text-dim">Draft preview</span>
        <span className="text-xs text-text-dim ml-auto">Not published until you save</span>
      </div>

      <div className="p-6 space-y-8">
        {/* Hero */}
        <section className="space-y-3">
          <p className="text-xs font-mono text-text-dim">HERO</p>
          <h2 className="text-3xl font-black tracking-tight text-text">{project.name || "Untitled project"}</h2>
          {project.hero_subtitle && (
            <p className="text-sm text-text-muted max-w-[60ch]">{project.hero_subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {project.repo_link && (
              <span className="badge">View Repository</span>
            )}
            {project.link_web && (
              <span className="badge">Visit Live Site</span>
            )}
            {!project.repo_link && !project.link_web && (
              <span className="badge">Contact me</span>
            )}
          </div>
        </section>

        {/* Metadata strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Service", value: project.project_type || "—" },
            { label: "Year", value: String(year) },
            { label: "Timeline", value: project.timeframe || "—" },
            { label: "Client", value: project.project_context || project.source || "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white/[0.05] border border-white/[0.12] p-3">
              <p className="text-[10px] font-mono tracking-widest uppercase text-text-dim">{item.label}</p>
              <p className="mt-1.5 text-sm font-semibold text-text line-clamp-2">{item.value}</p>
            </div>
          ))}
        </section>

        {/* Stack */}
        {frameworks.length > 0 && (
          <section>
            <p className="text-xs font-mono text-text-dim mb-3">STACK • {frameworks.length} tools</p>
            <div className="flex flex-wrap gap-2">
              {frameworks.map((fw) => (
                <span key={fw} className="rounded-full bg-white/[0.08] border border-white/[0.12] px-4 py-1.5 text-sm text-text">
                  {fw}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Hero image */}
        {project.foto_public_url && (
          <section>
            <p className="text-xs font-mono text-text-dim mb-3">HERO IMAGE</p>
            <div className="relative overflow-hidden rounded-xl bg-[#111010] border border-white/[0.10] aspect-[16/10] lg:aspect-[16/8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.foto_public_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </section>
        )}

        {/* Content sections */}
        <section className={`grid gap-8 ${hasCredits ? "lg:grid-cols-[0.82fr_1.18fr]" : "grid-cols-1"}`}>
          {hasCredits && (
            <div className="rounded-xl bg-white/[0.05] border border-white/[0.12] p-5 h-fit">
              <p className="text-[10px] font-mono tracking-widest uppercase text-text-dim mb-3">Credits</p>
              {teamQuote && (
                <p className="text-sm leading-relaxed text-text mb-4 line-clamp-6">
                  &ldquo;{teamQuote.slice(0, 320)}
                  {teamQuote.length > 320 ? "…" : ""}&rdquo;
                </p>
              )}
              <div className="space-y-2">
                {credits.map((c) => (
                  <div key={c.name} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-white/[0.06] last:border-0">
                    <span className="text-sm text-text">{c.name}</span>
                    <span className="text-[11px] font-mono uppercase text-text-dim shrink-0">{c.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {sections.length === 0 && (
              <p className="text-sm text-text-dim italic">
                No brief, challenge, or solution content yet.
              </p>
            )}
            {sections.map((s) => (
              <article key={s.key}>
                <h3 className="text-lg font-semibold text-text">{s.label}</h3>
                {s.data?.title && (
                  <p className="mt-1.5 text-sm font-medium text-text/90">{s.data.title}</p>
                )}
                <p className="mt-2.5 text-sm leading-relaxed text-text-muted whitespace-pre-line">
                  {s.data?.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Device showcase — only rendered when a screenshot exists */}
        {deviceScreens.length > 0 && (
          <section>
            <p className="text-xs font-mono text-text-dim mb-3">DEVICE SHOWCASE</p>
            <div className="flex items-end justify-center gap-8 py-6 rounded-xl bg-white/[0.02] border border-border">
              {deviceScreens.map((s) => (
                <div key={s.key} className="text-center">
                  <div
                    className={`relative overflow-hidden border-2 border-white/15 bg-black shadow-2xl ${
                      s.key === "mobile" ? "w-[120px] h-[240px] rounded-[20px]" : "w-[200px] h-[160px] rounded-[16px]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image!} alt={`${s.label} screenshot`} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 text-[10px] font-mono uppercase text-text-dim">{VIEW_TYPE_LABELS[s.key]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Desktop additional */}
        {screenshots.desktop && (
          <section>
            <p className="text-xs font-mono text-text-dim mb-3">DESKTOP ADDITIONAL</p>
            <div className="overflow-hidden rounded-xl border border-white/[0.10] bg-[#111010]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshots.desktop} alt="Desktop additional screenshot" className="w-full object-cover" />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
