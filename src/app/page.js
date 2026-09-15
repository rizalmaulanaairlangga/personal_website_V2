"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { n: "01", label: "Tools", href: "#tools" },
  { n: "02", label: "Projects", href: "#projects" },
  { n: "03", label: "Achievements", href: "#achievements" },
  { n: "04", label: "About", href: "#about" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introPhase, setIntroPhase] = useState("enter"); // enter | hold | exit | done
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    let lenis;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    });
    return () => lenis?.destroy();
  }, []);

  // Intro sequence: enter 700ms → hold 1800ms → exit 800ms → done (tetap -translate-y-full, tidak snap balik)
  useEffect(() => {
    const HOLD = 1800;
    const ENTER = 700;
    const EXIT = 800;
    const enterTimer = setTimeout(() => setIntroPhase("hold"), ENTER);
    const holdTimer = setTimeout(() => setIntroPhase("exit"), ENTER + HOLD);
    const doneTimer = setTimeout(() => {
      setIntroPhase("done");
    }, ENTER + HOLD + EXIT);
    // unmount setelah exit selesai, tanpa balik ke translate-y-0
    const hideTimer = setTimeout(() => setShowIntro(false), ENTER + HOLD + EXIT + 50);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // lock scroll when menu open or intro visible
  useEffect(() => {
    const locked = menuOpen || showIntro;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, showIntro]);

  return (
    <main className="relative min-h-screen bg-[#0a0404] overflow-x-hidden">
      {/* Intro - web dibuka → full hitam → nama muncul → full hitam slide ke atas hilang → selesai */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-transform duration-[800ms] ${introPhase === "exit" || introPhase === "done" ? "-translate-y-full" : "translate-y-0"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
          aria-hidden={introPhase === "done"}
        >
          <div className="overflow-visible px-2 py-3 -my-3">
            <div className="overflow-hidden px-1 py-2 -my-2">
              <p
                className={`text-[42px] sm:text-[56px] lg:text-[72px] font-black tracking-[-0.04em] text-white leading-none select-none transition-all duration-[700ms] ${introPhase === "enter" ? "translate-y-[110%] opacity-0" : "translate-y-0 opacity-100"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
              >
                RIZAL<span className="align-super text-[0.28em] font-light ml-[0.06em] relative -top-[0.05em] inline-block">®</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header - hanya logo */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#0a0404]/60 backdrop-blur-[12px]">
        <div className="mx-auto max-w-[1600px] px-[6%] md:px-[4.5%] lg:px-[7.2%] h-[64px] flex items-center justify-between">
          <a href="#" className="flex items-center group" aria-label="Home">
            <span className="relative w-[34px] h-[34px] rounded-full overflow-hidden bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <Image
                src="/images/logo-r.webp"
                alt="R logo"
                width={32}
                height={32}
                className="object-contain p-[4px]"
                priority
              />
            </span>
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="relative w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] flex flex-col items-center justify-center gap-[5px] hover:bg-white/[0.08] transition-colors"
          >
            <span
              className={`block w-[18px] h-[1.5px] bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[3.3px]" : ""}`}
            />
            <span
              className={`block w-[18px] h-[1.5px] bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[3.3px]" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu - CSS only, no framer-motion needed */}
      <div
        className={`fixed inset-0 z-40 bg-[#080405]/95 backdrop-blur-xl pt-[64px] transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="mx-auto max-w-[1600px] px-[6%] md:px-[4.5%] lg:px-[7.2%] py-10">
          {navItems.map((item) => (
            <a
              key={item.n}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-baseline gap-4 py-4 border-b border-white/5 text-[30px] tracking-[-0.03em] font-light hover:text-white transition-colors group"
            >
              <span className="text-[11px] font-mono text-white/35 tracking-[0.08em]">({item.n})</span>
              <span className="group-hover:translate-x-2 transition-transform duration-300">{item.label}</span>
            </a>
          ))}
          <p className="mt-8 text-sm leading-6 text-white/45 max-w-[32ch]">
            Crafting web experiences & logic solutions. Available for collaboration - let’s build something clean and fast.
          </p>
        </div>
      </div>

      {/* HERO - faithful to https://elvara.framer.website */}
      <section className="relative h-[100svh] min-h-[600px] lg:min-h-[640px] bg-[#0e0505] overflow-hidden grid-lines flex flex-col">
        {/* image layer - right half, behind grid + text, like Elvara */}
        <div className="absolute inset-0 lg:left-auto lg:w-[52%] lg:right-0 top-0 bottom-0">
          <Image
            src="/images/hero.webp"
            alt="Rizal hero"
            fill
            priority
            className="object-cover object-[50%_22%] lg:object-[50%_18%] brightness-[1.06] contrast-[1.02]"
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
          {/* blend image - shade tipis sampai garis biru, muka clean */}
          <div className="absolute inset-0 lg:hidden" style={{ background: `linear-gradient(to top, rgba(10,4,4,0.28) 0%, transparent 18%)` }} />
          <div className="absolute inset-0 hidden lg:block" style={{ background: `linear-gradient(to top, rgba(10,4,4,0.14) 0%, transparent 14%)` }} />
          {/* left edge fade - mobile lebih lebar sedikit, desktop lebih sempit agar tidak sampai muka (garis biru) */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background: `linear-gradient(to right, #0a0404 0%, rgba(10,4,4,0.62) 9%, rgba(10,4,4,0.14) 16.5%, transparent 24%)`,
            }}
          />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background: `linear-gradient(to right, #0a0404 0%, rgba(10,4,4,0.48) 7%, rgba(10,4,4,0.10) 12%, transparent 16.5%)`,
            }}
          />
        </div>

        {/* soft vignette + texture like Elvara */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_35%_45%,rgba(255,255,255,0.04),transparent_58%)] z-[1]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay z-[1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        {/* content - sits above image, grid-aligned */}
        <div className="relative z-10 flex-1 flex flex-col mx-auto w-full max-w-[1600px] px-[6%] md:px-[4.5%] lg:px-[7.2%] pt-[64px]">
          {/* top block: eyebrow + huge display */}
          <div className="pt-10 lg:pt-14">
            <div className="inline-flex items-center gap-3 text-[10px] sm:text-[11px] tracking-[0.16em] uppercase font-mono text-white/60">
              <span>Personal Portfolio</span>
              <span className="h-[1px] w-10 bg-white/25 hidden sm:block" />
              <span className="hidden sm:block w-1 h-1 rounded-full bg-white/60" />
            </div>

            <h1 className="hero-display mt-6 lg:mt-8 text-[66px] sm:text-[92px] md:text-[110px] lg:text-[150px] xl:text-[188px] 2xl:text-[208px]">
              Rizal<span className="align-super text-[0.36em] ml-[0.04em] font-light tracking-[-0.02em]">®</span>
            </h1>

            {/* hairline under display like Elvara subtle divider */}
            <div className="mt-4 lg:mt-6 h-[1px] w-full max-w-[560px] bg-gradient-to-r from-white/[0.09] via-white/[0.05] to-transparent" />
          </div>

          {/* bottom row - pushed to bottom via flex-1 spacer */}
          <div className="flex-1" />

          <div className="pb-8 lg:pb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            {/* left tagline - Building Brands equivalent */}
            <div className="max-w-[560px]">
              <h2 className="text-[22px] sm:text-[26px] lg:text-[34px] leading-[1.12] tracking-[-0.03em] font-light">
                <span className="text-white">Crafting Web Experiences</span>
                <br />
                <span className="text-white/60">& Logic Solutions</span>
              </h2>
              <p className="mt-4 text-[13px] leading-6 text-white/45 max-w-[46ch]">
                Informatics student - React, Tailwind, Supabase. 12 tools, 9+11 achievements, 4 web projects.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="#projects"
                  className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 transition-colors"
                >
                  View Projects →
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center px-5 py-2.5 rounded-full border border-white/14 text-white/85 text-[13px] hover:bg-white/5 transition-colors"
                >
                  About
                </a>
              </div>
            </div>

            {/* right nav list - visible on desktop like Elvara */}
            <div className="hidden lg:flex flex-col items-end gap-[6px] text-right shrink-0 pb-1">
              {navItems.map((item) => (
                <a
                  key={item.n}
                  href={item.href}
                  className="group flex items-center gap-2 text-[11px] font-mono tracking-[0.08em] text-white/50 hover:text-white transition-colors"
                >
                  <span className="group-hover:-translate-x-1 transition-transform duration-300">
                    ({item.n}) {item.label}
                  </span>
                </a>
              ))}
              <div className="mt-2 h-[1px] w-20 bg-white/10" />
              <span className="text-[10px] tracking-[0.14em] text-white/25 font-mono">©2026 - PENS</span>
            </div>
          </div>
        </div>

        {/* bottom hairline */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-white/[0.06] z-10" />
      </section>

      {/* Latest Project - after hero, style ref https://createstudio.framer.media/ */}
      <LatestProject />

      {/* What Can I Do - ref https://nakula.framer.website HOW WE CAN HELP (hardcode, no DB) */}
      <WhatCanIDo />

      {/* Sections */}
      <Section id="tools" k="01" title="Tools" desc="12 tools - from VSCode to Railway." />
      <Section id="projects" k="02" title="Projects" desc="4 web projects (2 kolaborasi + 2 personal) from Supabase." dark />
      <Section id="achievements" k="03" title="Achievements" desc="9 akademik + 11 non-akademik - medals, NLC, SIC6." />
      <Section id="about" k="04" title="About" desc="Informatics PENS - crafting clean, fast, dark-mode first experiences." dark />

      <footer className="border-t border-white/5 py-8 text-center text-xs font-mono tracking-[0.12em] text-white/30">
        © 2026 Rizal Maulana - Built with Next.js - Motion - Supabase - Tailwind
      </footer>
    </main>
  );
}

function LatestProject() {
  const [projects, setProjects] = useState([]);
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const [cursorActive, setCursorActive] = useState(false);
  const [activeLink, setActiveLink] = useState("#");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return;
    const supa = createClient(url, anon);
    supa
      .from("proyek_web")
      .select("*")
      .order("date", { ascending: false })
      .order("created_time", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setProjects(data);
      });
  }, []);

  // global fixed cursor - tidak terpotong di batas antar view (portal di luar card)
  // FIX: scroll tanpa gerak cursor harus tetap update visibility + hover + activeLink
  // root cause: mouseenter/mouseleave hanya fire saat pointer bergerak, tidak saat scroll
  useEffect(() => {
    const container = containerRef.current;
    const circle = cursorRef.current;
    if (!container || !circle) return;
    let raf = 0;
    let mx = 0, my = 0, cx = 0, cy = 0;
    let active = false;
    let hasPointer = false;
    let lastX = 0, lastY = 0;
    const tick = () => {
      raf = 0;
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      circle.style.transform = `translate3d(${cx - 112}px, ${cy - 112}px, 0)`;
      if (active && (Math.abs(mx - cx) > 0.4 || Math.abs(my - cy) > 0.4)) {
        raf = requestAnimationFrame(tick);
      }
    };
    const updateHoveredCard = (inside) => {
      const cards = container.querySelectorAll("[data-project-link]");
      if (!inside || !hasPointer) {
        cards.forEach((c) => c.removeAttribute("data-hovered"));
        return;
      }
      const el = document.elementFromPoint(lastX, lastY);
      const card = el?.closest?.("[data-project-link]");
      cards.forEach((c) => {
        if (c === card) c.setAttribute("data-hovered", "true");
        else c.removeAttribute("data-hovered");
      });
      if (card) setActiveLink(card.getAttribute("data-project-link") || "#");
    };
    const checkScroll = () => {
      if (!hasPointer) return;
      const rect = container.getBoundingClientRect();
      const inside = lastX >= rect.left && lastX <= rect.right && lastY >= rect.top && lastY <= rect.bottom;
      if (inside !== active) {
        active = inside;
        setCursorActive(inside);
      }
      updateHoveredCard(inside);
    };
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        checkScroll();
      });
    };
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      hasPointer = true;
      const rect = container.getBoundingClientRect();
      const inside = lastX >= rect.left && lastX <= rect.right && lastY >= rect.top && lastY <= rect.bottom;
      if (inside !== active) {
        active = inside;
        setCursorActive(inside);
      }
      // detect link dan hover hanya jika inside
      if (inside) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const card = el?.closest?.("[data-project-link]");
        if (card) setActiveLink(card.getAttribute("data-project-link") || "#");
      }
      updateHoveredCard(inside);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onGlobalMove = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      hasPointer = true;
      // jika global move terjadi di luar container tapi container baru saja discroll masuk, tetap perlu check
      // tidak perlu update mx/cx di sini (hanya lastX/Y untuk hit-test)
    };
    const onEnter = () => { active = true; setCursorActive(true); };
    const onLeave = () => { active = false; setCursorActive(false); };
    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousemove", onGlobalMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousemove", onGlobalMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, [projects.length]);

  if (!projects.length) {
    return (
      <section className="relative bg-black border-y border-white/5 py-16 flex items-center justify-center">
        <p className="text-xs font-mono tracking-[0.16em] text-white/30">LOADING LATEST PROJECTS...</p>
      </section>
    );
  }
  return (
    <>
      {/* fallback hover when scroll moves element under static pointer - mirrors group-hover */}
      <style>{`[data-hovered] .project-overlay{background-color:rgba(0,0,0,0.30)!important}[data-hovered] .project-mobile-circle{opacity:1!important}`}</style>
      <div ref={containerRef} className="relative cursor-none">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {/* global fixed orange circle - di luar card, tidak akan terpotong di sambungan */}
        <div
          ref={cursorRef}
          onClick={() => activeLink && window.open(activeLink, "_blank")}
          className={`hidden lg:flex fixed left-0 top-0 z-[60] w-[224px] h-[224px] rounded-full bg-[#FF4D2E] flex-col items-center justify-center gap-1 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] will-change-transform pointer-events-none ${cursorActive ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          style={{ transform: "translate3d(-112px,-112px,0)", transition: "opacity 200ms, transform 0ms" }}
        >
          <span className="text-[38px] font-black leading-none">→</span>
          <span className="text-[13px] font-black tracking-[0.14em] whitespace-nowrap scale-x-[1.08]">VIEW CASE STUDY</span>
        </div>
      </div>
      <ProjectYearBar />
    </>
  );
}

function ProjectCard({ project }) {
  const ref = useRef(null);
  const imgRef = useRef(null);

  // zoom: belum kelihatan = 1.16 (zoom in), mulai peek di bawah → zoom out, sampai full view = 1.0 (100%)
  useEffect(() => {
    const el = ref.current;
    const img = imgRef.current;
    if (!el || !img) return;
    let raf = 0;
    let current = 1.16;
    let target = 1.16;
    img.style.transform = `scale(${current})`;
    img.style.willChange = "transform";
    const tick = () => {
      raf = 0;
      current += (target - current) * 0.14;
      img.style.transform = `scale(${current})`;
      if (Math.abs(target - current) > 0.0004) {
        raf = requestAnimationFrame(tick);
      }
    };
    const updateTarget = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const header = 64;
      // 0 saat masih di bawah (rect.top==vh, sebelum kelihatan), 1 saat sudah pas di bawah header (rect.top==header) - posisi ideal Image1
      // jadi tidak perlu 1 scroll lagi, sudah full 100% di posisi terakhir yang diinginkan
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh - header)));
      target = 1.16 - progress * 0.16;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    updateTarget();
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateTarget();
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateTarget);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateTarget);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const year = project.date ? new Date(project.date).getFullYear() : 2025;
  const frameworks = project.frameworks || [];
  const title = project.name;
  const subtitle = project.description ? project.description.replace(/\.$/, "").toUpperCase() : "WEB PROJECT";
  const link = project.link_web || project.repo_link || "#";
  const img = project.foto_public_url;

  return (
    <section
      ref={ref}
      data-project-link={link}
      onClick={() => window.open(link, "_blank")}
      className="relative w-full h-[82vh] min-h-[540px] lg:min-h-[620px] bg-black group block"
      style={{ margin: 0 }}
    >
      {/* image wrapper - rounded halus agar kiri atas tidak tajam (Image1) */}
      <div className="absolute inset-0 overflow-hidden rounded-[12px] lg:rounded-[14px] pointer-events-none">
        {img ? (
          <img
            ref={imgRef}
            src={img}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ transform: "scale(1.16)" }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-[#111]" />
        )}
      </div>
      {/* overlays - support both CSS group-hover and JS data-hovered (for scroll-without-move) */}
      <div className="project-overlay absolute inset-0 bg-black/22 group-hover:bg-black/30 transition-colors duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      {/* top hairline + dashed */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/10" />
      <div className="absolute top-6 lg:top-8 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-[10px] opacity-25">
        {Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="w-[1px] h-[14px] bg-white/40 block" />
        ))}
      </div>
      <div className="absolute top-6 lg:top-8 left-[4%] lg:left-[3.5%] z-10">
        <p className="text-[11px] font-mono tracking-[0.14em] text-white/75 uppercase">
          {title.split(" ")[0]} <span className="text-white/40">- {year}</span>
        </p>
      </div>

      {/* center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[6%] text-center z-10 pointer-events-none">
        <h2 className="text-[36px] sm:text-[52px] lg:text-[68px] xl:text-[80px] font-medium tracking-[-0.04em] leading-[0.9] text-white max-w-[18ch] drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
          {title}
        </h2>
        <p className="mt-3 lg:mt-4 text-[11px] sm:text-[12px] font-mono tracking-[0.14em] text-white/75 uppercase max-w-[56ch] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* bottom */}
      <div className="absolute bottom-6 lg:bottom-8 left-[4%] lg:left-[3.5%] z-10">
        <ul className="flex flex-col gap-[3px]">
          {frameworks.slice(0, 5).map((fw) => (
            <li key={fw} className="text-[11px] sm:text-[12px] font-mono tracking-[0.08em] text-white leading-5 uppercase">
              {fw}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute bottom-6 lg:bottom-8 right-[4%] lg:right-[3.5%] z-10">
        <p className="text-[11px] sm:text-[12px] font-mono tracking-[0.08em] text-white/80">YR/ {year}</p>
      </div>

      {/* mobile tap circle - hanya mobile, desktop pakai global fixed agar tidak terpotong di batas */}
      <div
        className="project-mobile-circle lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[148px] h-[148px] rounded-full bg-[#FF4D2E] flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        <span className="text-[20px] font-black">→</span>
        <span className="text-[10px] font-black tracking-[0.08em] whitespace-nowrap">VIEW CASE STUDY</span>
      </div>
    </section>
  );
}

function ProjectYearBar() {
  const [range, setRange] = useState(null);
  const [count, setCount] = useState(null);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return;
    const supa = createClient(url, anon);
    supa.from("proyek_web").select("date").then(({ data }) => {
      if (!data || !data.length) return;
      const years = data.map((d) => (d.date ? new Date(d.date).getFullYear() : null)).filter(Boolean);
      if (!years.length) return;
      const min = Math.min(...years);
      const max = Math.max(...years);
      setRange(min === max ? `${min}` : `${min} - ${max}`);
      setCount(data.length);
    });
  }, []);
  if (!range) return null;
  return (
    <section className="relative bg-[#0a0a0a] border-y border-white/[0.06] py-10 lg:py-12">
      <div className="mx-auto max-w-[1600px] px-[6%] md:px-[4.5%] lg:px-[7.2%] flex items-center gap-4">
        <span className="text-[18px] lg:text-[20px] font-light tracking-[-0.02em] text-white whitespace-nowrap">{range}</span>
        <div className="flex-1 h-[1px] bg-white/15" />
        <a
          href="#projects"
          className="flex items-center gap-3 group shrink-0"
        >
          <span className="w-10 h-10 rounded-[10px] bg-[#FF4D2E] flex items-center justify-center text-white text-[18px] group-hover:scale-105 transition-transform">→</span>
          <span className="text-[14px] lg:text-[15px] font-medium tracking-[-0.02em] text-white">More Projects</span>
          <sup className="text-[10px] font-mono text-white/40 -top-1">{count}</sup>
        </a>
      </div>
    </section>
  );
}

function WhatCanIDo() {
  const [hovered, setHovered] = useState(null);

  const services = [
    {
      num: "01",
      title: "Frontend Development",
      desc: "Crafting fast and responsive interfaces with Next.js, React and Tailwind for clean and performant web experiences.",
      tags: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
      accent: "from-[#1a1a1a] to-[#2a1010]",
    },
    {
      num: "02",
      title: "Mobile Development",
      desc: "Cross platform mobile apps with Flutter and React Native, smooth native feel experiences on Android with clean state management.",
      tags: ["Flutter", "React Native", "Expo", "Dart"],
      accent: "from-[#0f1a2a] to-[#102a1a]",
    },
    {
      num: "03",
      title: "Backend Development",
      desc: "Scalable APIs and server logic with Node.js, Supabase and ASP.NET Core, auth, REST and realtime handled with clean and maintainable architecture.",
      tags: ["Node.js", "ASP.NET Core", "Supabase", "REST API"],
      accent: "from-[#1a102a] to-[#2a1a10]",
    },
    {
      num: "04",
      title: "Database Management",
      desc: "Postgres schema design, migrations, RLS and Storage, clean data modeling and optimized queries for reliable performance.",
      tags: ["PostgreSQL", "Migrations", "RLS Policies", "Storage"],
      accent: "from-[#101a1a] to-[#1a2a2a]",
    },
  ];

  return (
    <section className="relative bg-black border-y border-white/[0.06]">
      {/* header - judul diperbesar dan tebal */}
      <div className="mx-auto max-w-[1600px] px-[6%] md:px-[4.5%] lg:px-[7.2%] pt-10 lg:pt-14 pb-6 lg:pb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-[12px] lg:text-[13px] font-mono font-semibold tracking-[0.16em] text-white/60 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4D2E]" /> Services
          </p>
          <h2 className="mt-3 text-[44px] sm:text-[56px] lg:text-[72px] xl:text-[84px] font-black tracking-[-0.06em] leading-[0.9] text-white">
            What can I do?
          </h2>
        </div>
        <p className="hidden md:block text-[11px] font-mono tracking-[0.12em] text-white/25 uppercase max-w-[30ch] text-right leading-relaxed">
          4 core capabilities, frontend, mobile,<br /> backend and database
        </p>
      </div>

      <div className="mx-auto max-w-[1600px] px-[6%] md:px-[4.5%] lg:px-[7.2%] pb-6 lg:pb-8">
        {/* garis pemisah dipertebal lagi - mirip Nakula 1px tapi opacity lebih tinggi agar terlihat */}
        <div className="border-t border-white/[0.28]">
          {services.map((item, i) => {
            const isHovered = hovered === i;
            return (
              <motion.div
                key={item.num}
                layout
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                onClick={() => setHovered(isHovered ? null : i)}
                role="button"
                tabIndex={0}
                aria-expanded={isHovered}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setHovered(isHovered ? null : i)}
                className="border-b border-white/[0.26] cursor-pointer overflow-hidden"
                transition={{ layout: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
              >
                {/* ===== DESKTOP ===== */}
                <div className="hidden lg:block">
                  {/* baris persisten: nomor single element + judul kecil / judul besar */}
                  <div className="flex items-center -mx-[1.5%] px-[1.5%]">
                    {/* kiri persisten: nomor (single element yang membesar) + gambar */}
                    <div className="flex items-center gap-6 xl:gap-8 shrink-0 w-[520px] xl:w-[600px] py-0">
                       {/* nomor: fontSize uniform biar tidak melebar dulu - easing Nakula smooth */}
                      <div className="flex items-center shrink-0 py-[32px] w-[88px] xl:w-[102px]">
                        <motion.span
                          animate={{
                            fontSize: isHovered ? "62px" : "26px",
                          }}
                          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                          className="block font-mono tracking-[-0.02em] leading-none select-none shrink-0"
                          style={{
                            color: isHovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.42)",
                            fontWeight: isHovered ? 900 : 500,
                            lineHeight: 1,
                          }}
                        >
                          {item.num}
                          <span className="text-[#FF3B30]">.</span>
                        </motion.span>
                      </div>

                      {/* gambar: Nakula style - kecil transparan di tengah lalu membesar */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: isHovered ? "auto" : 0,
                          opacity: isHovered ? 1 : 0,
                        }}
                        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                        className="overflow-hidden shrink-0 my-[18px] w-[360px] xl:w-[420px] rounded-[16px]"
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isHovered ? 1 : 0.82,
                            y: isHovered ? 0 : 8,
                          }}
                          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                          className={`relative w-[360px] xl:w-[420px] h-[220px] xl:h-[240px] rounded-[16px] overflow-hidden bg-gradient-to-br ${item.accent} border border-white/[0.06] flex items-center justify-center overflow-hidden ${!isHovered ? "pointer-events-none" : ""}`}
                        >
                        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                        {item.num === "01" && <FrontendVisual />}
                        {item.num === "02" && <MobileVisual />}
                        {item.num === "03" && <BackendVisual />}
                        {item.num === "04" && <DatabaseVisual />}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-[0.14em] text-white/70 uppercase bg-black/35 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
                            0{item.num.slice(1)} • {item.title.split(" ")[0]}
                          </span>
                          <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-[12px]">→</span>
                        </div>
                      </motion.div>
                      </motion.div>
                    </div>

                    {/* kanan: judul */}
                    <div className="flex-1 min-w-0 pl-6 xl:pl-8 flex flex-col justify-center py-[18px]">
                      {/* judul kecil: saat hover terdorong ke atas - easing Nakula */}
                      <motion.div
                        animate={{
                          height: isHovered ? 0 : 108,
                          opacity: isHovered ? 0 : 1,
                          y: isHovered ? -16 : 0,
                        }}
                        transition={{
                          height: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
                          opacity: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
                          y: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
                        }}
                        className="overflow-hidden flex items-center"
                      >
                        <span className="block text-[26px] xl:text-[29px] font-semibold tracking-[-0.025em] text-white/90 text-left">
                          {item.title}
                        </span>
                      </motion.div>

                      {/* detail: satu blok halus - Nakula timing */}
                      <motion.div
                        animate={{
                          height: isHovered ? "auto" : 0,
                          opacity: isHovered ? 1 : 0,
                        }}
                        transition={{
                          height: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
                          opacity: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="py-1">
                          <h3 className="text-[32px] xl:text-[36px] font-bold tracking-[-0.04em] leading-[0.95] text-white">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-[14px] leading-relaxed text-white/50 max-w-[44ch]">{item.desc}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[12.5px] font-medium tracking-[-0.01em] text-white/70">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* ===== MOBILE ===== */}
                <div className="lg:hidden">
                  {/* baris atas: nomor + judul kecil */}
                  <motion.div
                    animate={{
                      height: isHovered ? 0 : 108,
                      opacity: isHovered ? 0 : 1,
                      y: isHovered ? -14 : 0,
                    }}
                    transition={{
                      height: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
                      opacity: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
                      y: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-3 py-[32px] -mx-[2%] px-[2%]">
                      <motion.span
                        animate={{ fontSize: isHovered ? "52px" : "24px" }}
                        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                        className="shrink-0 font-mono tracking-[-0.02em] leading-none select-none"
                        style={{
                          color: isHovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.42)",
                          fontWeight: isHovered ? 900 : 500,
                          lineHeight: 1,
                        }}
                      >
                        {item.num}
                        <span className="text-[#FF3B30]">.</span>
                      </motion.span>
                      <span className="text-[21px] font-semibold tracking-[-0.02em] text-white/90 text-right max-w-[60%] leading-tight">
                        {item.title}
                      </span>
                    </div>
                  </motion.div>

                  {/* expanded mobile */}
                  <motion.div
                    animate={{
                      height: isHovered ? "auto" : 0,
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{
                      height: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
                      opacity: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pb-7 pt-2">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[13px] font-mono tracking-[0.08em] text-white/35">
                          {item.num}
                          <span className="text-[#FF3B30]">.</span>
                        </span>
                      </div>
                      <div className={`relative w-full h-[210px] rounded-[14px] overflow-hidden bg-gradient-to-br ${item.accent} border border-white/[0.06] flex items-center justify-center`}>
                        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                        {item.num === "01" && <FrontendVisual />}
                        {item.num === "02" && <MobileVisual />}
                        {item.num === "03" && <BackendVisual />}
                        {item.num === "04" && <DatabaseVisual />}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-[0.14em] text-white/70 uppercase bg-black/35 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
                            0{item.num.slice(1)} • {item.title.split(" ")[0]}
                          </span>
                          <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-[12px]">→</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-[26px] font-bold tracking-[-0.04em] leading-[0.95] text-white">{item.title}</h3>
                        <p className="mt-3 text-[13px] leading-relaxed text-white/50">{item.desc}</p>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[12px] font-medium tracking-[-0.01em] text-white/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] font-mono tracking-[0.08em] text-white/20">Hover any row to reveal</p>
      </div>
    </section>
  );
}

function FrontendVisual() {
  return (
    <div className="absolute inset-0 p-3 lg:p-4 flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-black/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-black/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-black/10" />
        <span className="ml-auto h-[18px] px-2.5 rounded-full bg-white/10 border border-white/10 text-[8px] font-mono tracking-[0.08em] text-white/60 flex items-center">rizal.dev - Next.js</span>
      </div>
      <div className="mt-3 flex-1 grid grid-cols-[1.35fr_0.85fr] gap-2.5">
        <div className="rounded-[10px] bg-black/40 border border-white/10 p-2.5 flex flex-col gap-1.5 overflow-hidden">
          <div className="flex items-center gap-1 text-[7px] font-mono text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D2E]" /> app/page.tsx
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-[72%] rounded bg-[#7DD3FC]/70" />
            <div className="h-1.5 w-full rounded bg-white/15" />
            <div className="h-1.5 w-[88%] rounded bg-white/10" />
            <div className="h-1.5 w-[62%] rounded bg-[#A5B4FC]/50" />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <div className="h-[28px] rounded bg-white/90 flex items-center justify-center text-[7px] font-bold text-black">UI Card</div>
            <div className="h-[28px] rounded bg-white/10 border border-white/10" />
          </div>
          <div className="mt-auto flex gap-1">
            <span className="h-1.5 w-8 rounded-full bg-[#FF4D2E]/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex-1 rounded-[10px] bg-white p-2.5 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <div className="w-6 h-6 rounded-full bg-[#0a0404] flex items-center justify-center text-[8px] font-black text-white">R</div>
            <div className="mt-2 h-1.5 w-3/4 rounded bg-black/10" />
            <div className="mt-1 h-1 w-full rounded bg-black/5" />
            <div className="mt-1 h-1 w-5/6 rounded bg-black/5" />
            <div className="mt-auto h-5 rounded-full bg-black text-white flex items-center justify-center text-[7px] font-bold">View →</div>
          </div>
          <div className="h-[36px] rounded-[10px] bg-[#FF4D2E] p-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] text-white">◩</span>
            <div className="flex-1">
              <div className="h-1 w-10 rounded bg-white/90" />
              <div className="mt-1 h-1 w-6 rounded bg-white/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-3">
      <div className="relative flex items-center gap-3">
        <div className="relative w-[108px] h-[192px] rounded-[18px] bg-black border-[3px] border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          <div className="h-5 bg-white/5 flex items-center justify-between px-3">
            <span className="text-[6px] font-mono text-white/40">9:41</span>
            <span className="flex gap-0.5"><span className="w-2 h-1 rounded bg-white/60" /><span className="w-1 h-1 rounded-full bg-white/30" /></span>
          </div>
          <div className="px-2.5 pt-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#02569B] flex items-center justify-center text-[7px] font-black text-white">F</span>
            <div className="flex-1">
              <div className="h-1 w-8 rounded bg-white/80" />
              <div className="mt-1 h-1 w-5 rounded bg-white/20" />
            </div>
            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[7px] text-white/60">◈</span>
          </div>
          <div className="mt-2 mx-2 rounded-[10px] bg-white p-2">
            <div className="h-1.5 w-3/4 rounded bg-black/10" />
            <div className="mt-1 h-1 w-full rounded bg-black/5" />
            <div className="mt-2 h-10 rounded bg-[#0a0404]/5 border border-black/5 flex items-center justify-center">
              <span className="text-[14px]">📱</span>
            </div>
            <div className="mt-2 h-4 rounded-full bg-black flex items-center justify-center text-[6px] font-bold text-white">Open App</div>
          </div>
          <div className="mt-auto mx-auto mb-1.5 w-8 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="w-[72px] rounded-[10px] bg-white/10 backdrop-blur border border-white/10 p-2">
            <div className="text-[6px] font-mono tracking-[0.08em] text-white/50 uppercase">Flutter</div>
            <div className="mt-1 h-1 w-full rounded bg-white/20" />
            <div className="mt-1 h-1 w-2/3 rounded bg-white/20" />
          </div>
          <div className="w-[72px] rounded-[10px] bg-white p-2 shadow-md">
            <div className="text-[6px] font-mono tracking-[0.08em] text-black/40 uppercase">React Native</div>
            <div className="mt-1 flex gap-1">
              <span className="h-1.5 flex-1 rounded bg-black" />
              <span className="h-1.5 flex-1 rounded bg-black/10" />
            </div>
          </div>
          <div className="w-[72px] rounded-full bg-[#FF4D2E] px-2 py-1.5 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[6px] font-bold tracking-[0.08em] text-white">LIVE PREVIEW</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackendVisual() {
  return (
    <div className="absolute inset-0 p-3 lg:p-4 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[7px] font-mono tracking-[0.12em] text-white/40 uppercase">API Gateway - Scalable</span>
        <span className="flex items-center gap-1 text-[7px] font-mono text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> live</span>
      </div>
      <div className="mt-3 flex-1 flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <span className="w-8 h-8 rounded-[9px] bg-white flex items-center justify-center text-[11px]">🌐</span>
          <span className="text-[6px] font-mono text-white/50">Client</span>
        </div>
        <span className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-white/20 relative"><span className="absolute right-0 -top-[3px] text-[7px] text-white/50">▸</span></span>
        <div className="flex flex-col gap-1.5">
          <div className="w-[92px] rounded-[9px] bg-[#68A063] px-2 py-1.5 flex items-center gap-1.5 border border-white/10 shadow">
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[7px] font-black text-[#68A063]">N</span>
            <div><div className="text-[7px] font-bold leading-none text-white">Node.js</div><div className="text-[6px] font-mono leading-none text-white/70">REST - Auth</div></div>
            <span className="ml-auto text-[7px] text-white/80">●</span>
          </div>
          <div className="w-[92px] rounded-[9px] bg-[#512BD4] px-2 py-1.5 flex items-center gap-1.5 border border-white/10 shadow">
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[6px] font-black text-[#512BD4]">.NET</span>
            <div><div className="text-[7px] font-bold leading-none text-white">ASP.NET Core</div><div className="text-[6px] font-mono leading-none text-white/70">API - Clean Arch</div></div>
            <span className="ml-auto text-[7px] text-white/80">●</span>
          </div>
        </div>
        <span className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-white/20 relative"><span className="absolute right-0 -top-[3px] text-[7px] text-white/50">▸</span></span>
        <div className="flex flex-col items-center gap-1">
          <span className="w-8 h-8 rounded-[9px] bg-[#3ECF8E] flex items-center justify-center text-[10px] font-black text-white">S</span>
          <span className="text-[6px] font-mono text-white/50">Supabase</span>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1.5 rounded-full bg-black/30 border border-white/10 px-2 py-1">
        <span className="text-[6px] font-mono text-white/40">GET</span>
        <span className="text-[6px] font-mono text-white/70">/api/v1/projects</span>
        <span className="ml-auto text-[6px] font-mono text-emerald-300">200 OK - 42ms</span>
      </div>
    </div>
  );
}

function DatabaseVisual() {
  return (
    <div className="absolute inset-0 p-3 lg:p-4 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[7px] font-mono tracking-[0.08em] text-white/50 uppercase"><span className="w-4 h-4 rounded bg-[#336791] flex items-center justify-center text-[7px] font-black text-white">◈</span> PostgreSQL - RLS Enabled</span>
        <span className="text-[6px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-emerald-300">migrated</span>
      </div>
      <div className="mt-2.5 flex-1 grid grid-cols-[1.15fr_0.85fr] gap-2.5">
        <div className="rounded-[10px] bg-black/40 border border-white/10 overflow-hidden flex flex-col">
          <div className="h-5 bg-white/5 flex items-center px-2 gap-1">
            <span className="text-[6px] font-mono text-white/60">proyek_web</span>
            <span className="ml-auto text-[5px] font-mono px-1 py-0.5 rounded bg-white/10 text-white/50">12 rows</span>
          </div>
          <div className="px-2 py-1.5 grid grid-cols-[16px_1fr_36px] gap-1 text-[5.5px] font-mono text-white/30 uppercase tracking-[0.06em]">
            <span>#</span><span>name</span><span className="text-right">date</span>
          </div>
          <div className="px-1 space-y-0.5">
            {[
              ["1", "E Commerce", "2025"],
              ["2", "SIPENS", "2024"],
              ["3", "Portfolio", "2026"],
            ].map((r) => (
              <div key={r[0]} className="grid grid-cols-[16px_1fr_36px] gap-1 items-center rounded bg-white/5 px-1 py-1 text-[6px] font-mono text-white/70">
                <span className="text-white/30">{r[0]}</span><span className="truncate">{r[1]}</span><span className="text-right text-white/40">{r[2]}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto h-5 bg-white/5 flex items-center px-2 gap-1 text-[5px] font-mono text-white/40">
            <span className="w-1 h-1 rounded-full bg-emerald-400" /> RLS - Storage - Realtime
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="rounded-[10px] bg-white p-2">
            <div className="text-[6px] font-mono tracking-[0.08em] text-black/40 uppercase">Schema</div>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-1 text-[6px] font-mono"><span className="w-1 h-1 rounded-full bg-[#FF4D2E]" /> id <span className="ml-auto text-black/30">uuid PK</span></div>
              <div className="flex items-center gap-1 text-[6px] font-mono"><span className="w-1 h-1 rounded-full bg-[#336791]" /> name <span className="ml-auto text-black/30">text</span></div>
              <div className="flex items-center gap-1 text-[6px] font-mono"><span className="w-1 h-1 rounded-full bg-emerald-500" /> date <span className="ml-auto text-black/30">timestamptz</span></div>
            </div>
            <div className="mt-2 h-1 w-full rounded bg-black/5" />
            <div className="mt-1 h-1 w-2/3 rounded bg-black/5" />
          </div>
          <div className="rounded-[10px] bg-[#0a0404] border border-white/10 p-2">
            <div className="text-[6px] font-mono text-white/40">Query</div>
            <div className="mt-1 font-mono text-[5.5px] leading-relaxed text-white/70">
              SELECT *<br />FROM proyek_web<br />ORDER BY date DESC
            </div>
            <div className="mt-1.5 text-[5px] font-mono text-emerald-300">↳ 42ms - indexed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, k, title, desc, dark }) {
  return (
    <section
      id={id}
      className={`relative border-b border-white/[0.04] ${dark ? "bg-[#0c0a0a]" : "bg-[#0a0404]"}`}
    >
      <div className="mx-auto max-w-[1600px] px-[6%] md:px-[4.5%] lg:px-[7.2%] py-16 lg:py-20">
        <div className="flex items-start justify-between gap-8">
          <div className="flex gap-4">
            <span className="text-[11px] font-mono tracking-[0.12em] text-white/30 mt-1">({k})</span>
            <div>
              <h3 className="text-[26px] lg:text-[34px] tracking-[-0.03em] font-light">{title}</h3>
              <p className="mt-2 text-sm text-white/50 max-w-[44ch]">{desc}</p>
              <p className="mt-4 text-xs font-mono text-white/25">
                Supabase → <code className="text-white/40">select * from {id}</code> (anon read)
              </p>
            </div>
          </div>
          <span className="hidden md:block text-[11px] font-mono text-white/20">→</span>
        </div>
      </div>
    </section>
  );
}
