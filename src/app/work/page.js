import { createClient } from "@supabase/supabase-js";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
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
      <SiteNav />
      <div className="relative z-10 bg-[#0A0404]">
        <section className="pt-[76px] md:pt-[92px] bg-[#0A0404] overflow-hidden">
          <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pt-10 lg:pt-14 pb-8 lg:pb-10">
            <BackLink goBack href="/" className="inline-flex items-center gap-1.5 text-[15px] font-mono tracking-[0.08em] text-[#F0F3FF]/60 hover:text-[#F0F3FF] transition-colors min-h-[44px]">
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
            <p className="mt-4 text-[16px] font-mono tracking-[0.08em] text-[#F0F3FF]/60">{list.length} PROJECTS</p>
          </div>
        </section>
        <section className="bg-[#0A0404] border-t border-white/[0.08] py-10 lg:py-12">
          <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%]">
            <ProjectGrid projects={list} />
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
