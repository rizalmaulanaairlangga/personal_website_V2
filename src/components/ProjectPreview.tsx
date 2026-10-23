"use client";

import { Project } from "@/lib/types";

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

  const mobileOnly = project.screenshot_layout === "mobile_only";
  const deviceScreens: { key: string; label: string; image: string | null }[] = (
    mobileOnly
      ? [
          { key: "mobile", label: "Mobile 1", image: screenshots.mobile },
          { key: "mobile2", label: "Mobile 2", image: screenshots.mobile2 },
          { key: "mobile3", label: "Mobile 3", image: screenshots.mobile3 },
        ]
      : [
          { key: "mobile", label: "Mobile", image: screenshots.mobile },
          { key: "tablet", label: "Tablet", image: screenshots.tablet },
        ]
  ).filter((s) => s.image);

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-[#0A0404] overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-white/[0.03] px-4 py-3">
        <span className="w-2 h-2 rounded-full bg-warning" aria-hidden="true" />
        <span className="text-xs font-mono tracking-wider uppercase text-text-dim">Draft preview</span>
        <span className="ml-auto text-xs text-text-dim">Not published until you save</span>
      </div>

      <div className="min-w-0 space-y-8 p-4 sm:p-6">
        {/* Hero */}
        <section className="space-y-3">
          <p className="text-xs font-mono text-text-dim">HERO</p>
          <h2 className="break-words text-2xl font-black tracking-tight text-text sm:text-3xl">{project.name || "Untitled project"}</h2>
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
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            { label: "Service", value: project.project_type || "—" },
            { label: "Year", value: String(year) },
            { label: "Timeline", value: project.timeframe || "—" },
            { label: "Client", value: project.project_context || project.source || "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white/[0.05] border border-white/[0.12] p-3">
              <p className="text-[10px] font-mono tracking-widest uppercase text-text-dim">{item.label}</p>
              <p className="mt-1.5 break-words text-sm font-semibold text-text line-clamp-2">{item.value}</p>
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
            <p className="text-xs font-mono text-text-dim mb-3">
              {mobileOnly ? "HERO MOBILE SCREENSHOT" : "HERO IMAGE"}
            </p>
            {mobileOnly ? (
              <div className="flex justify-center rounded-xl border border-white/[0.10] bg-[#111010] p-6">
                <div className="relative aspect-[9/19.5] w-40 overflow-hidden rounded-[24px] border-2 border-primary/50 bg-black p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.foto_public_url} alt="" className="h-full w-full rounded-[18px] object-contain" />
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.10] bg-[#111010] lg:aspect-[16/8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.foto_public_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}
          </section>
        )}

        {/* Content sections */}
        <section className={`grid min-w-0 gap-8 ${hasCredits ? "xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]" : "grid-cols-1"}`}>
          {hasCredits && (
            <div className="h-fit min-w-0 rounded-xl border border-white/[0.12] bg-white/[0.05] p-5">
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
                    <span className="min-w-0 break-words text-sm text-text">{c.name}</span>
                    <span className="max-w-[45%] break-words text-right text-[11px] font-mono uppercase text-text-dim">{c.role}</span>
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
                <p className="mt-2.5 break-words text-sm leading-relaxed text-text-muted whitespace-pre-line">
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
            <div className="flex flex-wrap items-end justify-center gap-5 rounded-xl border border-border bg-white/[0.02] py-6 sm:gap-8">
              {deviceScreens.map((s) => (
                <div key={s.key} className="text-center">
                  <div
                    className={`relative overflow-hidden border-2 border-white/15 bg-black shadow-2xl ${
                      s.key.startsWith("mobile") ? "w-[120px] h-[240px] rounded-[20px]" : "w-[200px] h-[160px] rounded-[16px]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image!} alt={`${s.label} screenshot`} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 text-[10px] font-mono uppercase text-text-dim">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Desktop additional */}
        {!mobileOnly && screenshots.desktop && (
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
