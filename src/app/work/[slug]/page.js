import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import BackLink from "./BackLink";
import MoreProjects from "./MoreProjects";
import ScrollToTop from "./ScrollToTop";

export const revalidate = 60;

export async function generateStaticParams() {
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await supa.from("proyek_web").select("slug").not("slug", "is", null);
  return (data || []).map((r) => ({ slug: r.slug }));
}
export async function generateMetadata({ params }) {
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await supa.from("proyek_web").select("seo_title,seo_desc,name,description").eq("slug", params.slug).single();
  if (!data) return {};
  return { title: data.seo_title || data.name, description: data.seo_desc || data.description };
}

export default async function WorkDetail({ params }) {
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: project } = await supa.from("proyek_web").select("*").eq("slug", params.slug).single();
  if (!project) notFound();

  const brief = project.brief || {};
  const challenge = project.challenge || {};
  const solution = project.solution || {};
  const credits = project.credits || [];
  const frameworks = project.frameworks || [];
  const gallery = project.gallery || [];
  const teamQuote = project.team_quote || null;
  const year = project.date ? new Date(project.date).getFullYear() : "-";
  const hasCredits = credits.length > 0;
  const hasGallery = gallery.length > 0;

  const { data: more } = await supa
    .from("proyek_web")
    .select("name,slug,foto_public_url,project_type")
    .neq("id", project.id)
    .order("date", { ascending: false })
    .limit(4);

  const heroDesc = project.hero_subtitle || project.description || "";

  return (
    <main className="relative min-h-screen bg-[#0A0404] text-[#F0F3FF] overflow-x-clip [overscroll-behavior:none]">
      <ScrollToTop />
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0A0404]/85 backdrop-blur-[12px] border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] h-[56px] flex items-center justify-between">
          <BackLink href="/" clearScroll className="flex items-center justify-center min-w-[44px] min-h-[44px] group" aria-label="Home">
            <span className="relative w-[38px] h-[38px] rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-visible p-[7px]">
              <Image
                src="/images/logo-r.webp"
                alt="R logo"
                width={24}
                height={24}
                className="object-contain w-[24px] h-[24px] shrink-0"
                priority
              />
            </span>
          </BackLink>
          <div className="hidden md:flex items-center gap-6 text-[12px] font-mono tracking-[0.10em] text-[#F0F3FF]/70">
            <span className="text-[#F0F3FF]">WORK</span><span>STUDIO</span><span>WHISPERS</span>
          </div>
          <BackLink href="/#contact" className="inline-flex items-center min-h-[44px] text-[12px] font-mono tracking-[0.10em] text-[#F0F3FF]/85 hover:text-[#F0F3FF] transition-colors">CONTACT</BackLink>
        </div>
      </header>
      <div className="relative z-10 bg-[#0A0404] shadow-[0_32px_100px_rgba(0,0,0,0.65)]">
      <section className="pt-[56px] bg-[#0A0404] border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pt-10 lg:pt-14 pb-8 lg:pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-start">
            
            <div>
              <BackLink goBack href="/" className="inline-flex items-center gap-1.5 text-[13px] font-mono tracking-[0.08em] text-[#F0F3FF]/60 hover:text-[#F0F3FF] transition-colors min-h-[44px]">
                <span aria-hidden>←</span> Back
              </BackLink>
              <h1 className="mt-4 text-[48px] sm:text-[64px] lg:text-[88px] xl:text-[96px] font-black tracking-[-0.05em] leading-[0.85] text-[#F0F3FF]">
                {project.name}
              </h1>
            </div>
            
            <div className="lg:pt-14 lg:text-right flex flex-col items-start lg:items-end gap-6">
              {heroDesc && (
                <p className="text-[19px] sm:text-[20px] lg:text-[22px] leading-[1.6] text-[#F0F3FF]/85 max-w-[36ch] lg:max-w-[30ch] lg:ml-auto font-normal tracking-[-0.01em]">
                  {heroDesc}
                </p>
              )}
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {project.link_web ? (
                  <a
                    href={project.link_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white text-[#0A0404] text-[16px] lg:text-[17px] font-semibold hover:bg-white/90 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)] min-h-[52px]"
                  >
                    Visit Live Site
                    <span className="w-10 h-10 rounded-full bg-[#7AB8E8] text-white flex items-center justify-center text-[18px] leading-none">→</span>
                  </a>
                ) : (
                  <a
                    href="/#contact"
                    className="inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white text-[#0A0404] text-[16px] lg:text-[17px] font-semibold hover:bg-white/90 transition-colors min-h-[52px]"
                  >
                    Contact me
                    <span className="w-10 h-10 rounded-full bg-[#7AB8E8] text-white flex items-center justify-center text-[18px]">→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#0A0404] border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pb-6 lg:pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="rounded-[12px] bg-white/[0.08] border border-white/[0.14] p-5 lg:p-6 backdrop-blur-[8px] shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.12em] text-[#F0F3FF]/85 uppercase">Service</p>
              <p className="mt-2.5 text-[18px] lg:text-[20px] font-semibold leading-snug text-[#F0F3FF]">{project.project_type || "-"}</p>
            </div>
            <div className="rounded-[12px] bg-white/[0.08] border border-white/[0.14] p-5 lg:p-6 backdrop-blur-[8px] shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.12em] text-[#F0F3FF]/85 uppercase">Year</p>
              <p className="mt-2.5 text-[18px] lg:text-[20px] font-semibold leading-snug text-[#F0F3FF]">{year}</p>
            </div>
            <div className="rounded-[12px] bg-white/[0.08] border border-white/[0.14] p-5 lg:p-6 backdrop-blur-[8px] shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.12em] text-[#F0F3FF]/85 uppercase">Timeline</p>
              <p className="mt-2.5 text-[18px] lg:text-[20px] font-semibold leading-snug text-[#F0F3FF]">{project.timeframe || "-"}</p>
            </div>
            <div className="rounded-[12px] bg-white/[0.08] border border-white/[0.14] p-5 lg:p-6 backdrop-blur-[8px] shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.12em] text-[#F0F3FF]/85 uppercase">Client</p>
              <p className="mt-2.5 text-[18px] lg:text-[20px] font-semibold leading-snug text-[#F0F3FF]">{project.project_context || project.source || "-"}</p>
            </div>
          </div>
          {frameworks.length > 0 && (
            <div className="mt-6 lg:mt-7">
              <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.12em] text-[#F0F3FF]/80 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7AB8E8]" /> Stack • {frameworks.length} tools
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                {frameworks.map((fw) => (
                  <span
                    key={fw}
                    className="inline-flex items-center rounded-full bg-white/[0.09] border border-white/[0.14] px-5 py-2 text-[15px] lg:text-[16px] font-medium tracking-[-0.01em] text-[#F0F3FF] backdrop-blur-[6px] hover:bg-white/[0.13] transition-colors"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="bg-[#0A0404] pb-8 lg:pb-10">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%]">
          <div className="relative overflow-hidden rounded-[16px] bg-[#111010] border border-white/[0.10] aspect-[16/10] lg:aspect-[16/8]">
            {project.foto_public_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.foto_public_url} alt={project.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[#1A1A1A]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>
      <section className="bg-[#0A0404] border-y border-white/[0.08] py-10 lg:py-16">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%]">
          <div className={`grid gap-8 lg:gap-10 ${hasCredits ? "lg:grid-cols-[0.82fr_1.18fr]" : "grid-cols-1 max-w-[760px]"}`}>
            {hasCredits && (
              <div className="lg:sticky lg:top-[72px] self-start">
                <div className="rounded-[14px] bg-white/[0.08] border border-white/[0.14] p-6 lg:p-7 backdrop-blur-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] bg-white/[0.10] border border-white/[0.14] flex items-center justify-center text-[14px] font-bold text-[#F0F3FF]">
                      {credits[0]?.name?.[0] || "R"}
                    </div>
                    <div className="text-[12px] font-mono font-semibold tracking-[0.10em] text-[#F0F3FF]/80">CREDITS</div>
                  </div>
                  {teamQuote && (
                    <p className="mt-5 text-[17px] lg:text-[18px] leading-[1.65] tracking-[-0.01em] text-[#F0F3FF]">
                      &ldquo;{teamQuote.slice(0, 320)}
                      {teamQuote.length > 320 ? "…" : ""}&rdquo;
                    </p>
                  )}
                  <div className="mt-6 space-y-0 border-t border-white/[0.08] pt-4">
                    {credits.map((c) => (
                      <div key={c.name} className="flex items-baseline justify-between gap-4 py-3 border-b border-white/[0.08] last:border-0">
                        <p className="text-[15.5px] lg:text-[16px] font-medium tracking-[-0.01em] leading-none text-[#F0F3FF]">{c.name}</p>
                        <p className="text-[13px] lg:text-[13.5px] font-mono tracking-[0.06em] text-[#F0F3FF]/80 uppercase shrink-0 leading-none">{c.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-12 lg:space-y-14">
              <article>
                <h2 className="text-[30px] lg:text-[36px] font-semibold tracking-[-0.03em] leading-[0.95] text-[#F0F3FF]">Project overview</h2>
                <p className="mt-5 text-[18px] lg:text-[20px] leading-[1.7] tracking-[-0.015em] text-[#F0F3FF] max-w-[60ch]">
                  {brief.body || project.description || ""}
                </p>
                {brief.title && <p className="mt-4 text-[16px] lg:text-[17px] font-medium leading-[1.6] text-[#F0F3FF]/90">{brief.title}</p>}
              </article>

              <article>
                <h2 className="text-[30px] lg:text-[36px] font-semibold tracking-[-0.03em] leading-[0.95] text-[#F0F3FF]">Project process</h2>
                <p className="mt-5 text-[18px] lg:text-[20px] leading-[1.7] tracking-[-0.015em] text-[#F0F3FF] max-w-[60ch]">
                  {challenge.body || ""}
                </p>
                {challenge.title && <p className="mt-4 text-[16px] lg:text-[17px] font-medium leading-[1.6] text-[#F0F3FF]/90">{challenge.title}</p>}
              </article>

              <article>
                <h2 className="text-[30px] lg:text-[36px] font-semibold tracking-[-0.03em] leading-[0.95] text-[#F0F3FF]">Final result</h2>
                <p className="mt-5 text-[18px] lg:text-[20px] leading-[1.7] tracking-[-0.015em] text-[#F0F3FF] max-w-[60ch]">
                  {solution.body || ""}
                </p>
                {solution.title && <p className="mt-4 text-[16px] lg:text-[17px] font-medium leading-[1.6] text-[#F0F3FF]/90">{solution.title}</p>}
                {project.link_web ? (
                  <a
                    href={project.link_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white text-[#0A0404] text-[16px] lg:text-[17px] font-semibold hover:bg-white/90 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)] min-h-[52px]"
                  >
                    Visit Live Site
                    <span className="w-10 h-10 rounded-full bg-[#7AB8E8] text-white flex items-center justify-center text-[18px] leading-none">→</span>
                  </a>
                ) : null}
              </article>
            </div>
          </div>
        </div>
      </section>
      {hasGallery && (
        <section className="bg-[#0A0404] border-b border-white/[0.06] py-8 lg:py-10">
          <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gallery.slice(0, 4).map((src, i) => (
                <div key={i} className="overflow-hidden rounded-[14px] bg-[#111] border border-white/[0.06] aspect-[4/3] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <MoreProjects projects={more} />
      {/* LOCKED PACKAGE: Contact + SiteFooter — do not separate or edit independently without approval */}
      <section id="contact" className="relative bg-[#0a0404] border-y border-white/[0.06]">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] py-8 lg:py-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="text-center">
            <p className="text-[11px] lg:text-[12px] font-medium tracking-[0.16em] uppercase text-[#F0F3FF]/82">Email Address</p>
            <a href="mailto:rizalmaulanaairlangga456@gmail.com" className="mt-2 inline-block text-[15px] lg:text-[16px] font-medium tracking-[-0.01em] text-white hover:text-white/80 transition-colors break-all">
              rizalmaulanaairlangga456@gmail.com
            </a>
          </div>
          <div className="text-center">
            <p className="text-[11px] lg:text-[12px] font-medium tracking-[0.16em] uppercase text-[#F0F3FF]/82">Social Links</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <a href="https://www.instagram.com/a_rizal_i/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-black transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.6"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/rizal-maulana-airlangga-072b21346/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-black transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="mailto:rizalmaulanaairlangga456@gmail.com" aria-label="Email" className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-black transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6.5C4 5.67 4.67 5 5.5 5H18.5C19.33 5 20 5.67 20 6.5V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7L12 12.5L19 7" stroke="currentColor" strokeWidth="1.5"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>
      <SiteFooter />
    </main>
  );
}
