import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import BackLink from "./[slug]/BackLink";
import FullBleedHeading from "./FullBleedHeading";
import ProjectGrid from "./ProjectGrid";

export const revalidate = 60;

export const metadata = {
  title: "My Projects",
  description: "My web projects.",
};

export default async function AllProjects() {
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: projects } = await supa
    .from("proyek_web")
    .select("name,slug,foto_public_url,project_type,date")
    .order("date", { ascending: false });

  const list = projects || [];

  return (
    <main className="relative min-h-screen bg-[#0A0404] text-[#F0F3FF] overflow-x-clip [overscroll-behavior:none]">
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
        <section className="pt-[56px] bg-[#0A0404] overflow-hidden">
          <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pt-10 lg:pt-14 pb-8 lg:pb-10">
            <BackLink goBack href="/" className="inline-flex items-center gap-1.5 text-[13px] font-mono tracking-[0.08em] text-[#F0F3FF]/60 hover:text-[#F0F3FF] transition-colors min-h-[44px]">
              <span aria-hidden>←</span> Back
            </BackLink>
            <div className="mt-4">
              <FullBleedHeading
                tag="h1"
                text="my projects"
                label={`My projects, ${list.length} projects`}
                className="tracking-[0.02em] [word-spacing:0.14em] text-[#F0F3FF]"
              />
            </div>
            <p className="mt-4 text-[14px] font-mono tracking-[0.08em] text-[#F0F3FF]/60">{list.length} PROJECTS</p>
          </div>
        </section>
        <section className="bg-[#0A0404] border-t border-white/[0.08] py-10 lg:py-12">
          <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%]">
            <ProjectGrid projects={list} />
          </div>
        </section>
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
