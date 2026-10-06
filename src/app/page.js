"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import SiteNav from "@/components/SiteNav";

const navItems = [
  { n: "01", label: "Tools", href: "#tools" },
  { n: "02", label: "About", href: "#about" },
  { n: "03", label: "Services", href: "#services" },
  { n: "04", label: "Contact", href: "#contact" },
];

export default function Home() {
  const [introPhase, setIntroPhase] = useState("enter"); // enter | hold | exit | done
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    try {
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    } catch {}
    const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    let lenis;
    let rafId = 0;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 0.55,
        touchMultiplier: 0.85,
        smoothWheel: true,
        gestureOrientation: "vertical",
        infinite: false,
        lerp: 0.075,
      });
      try { window.lenis = lenis; } catch {}
      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
      try { if (window.lenis === lenis) delete window.lenis; } catch {}
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const save = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        try { sessionStorage.setItem("landing-scroll-y", String(window.scrollY)); } catch {}
      });
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (showIntro) return;
    try {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        sessionStorage.removeItem("landing-restore");
        const id = hash.slice(1);
        const timer = setTimeout(() => {
          try {
            const el = document.getElementById(id);
            if (!el) return;
            const sm = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
            const actual = el.getBoundingClientRect().top;
            if (Math.abs(actual - sm) <= 8) return;
            if (actual < -30 || actual > sm + 120) return;
            const lenis = window.lenis;
            if (lenis?.scrollTo) lenis.scrollTo(el, { duration: 0.9 });
            else el.scrollIntoView({ behavior: "smooth", block: "start" });
          } catch {}
        }, 900);
        return () => clearTimeout(timer);
      }
      const saved = parseInt(sessionStorage.getItem("landing-scroll-y") || "0", 10);
      if (saved > 0 && window.scrollY < saved - 4) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              const lenis = window.lenis;
              if (lenis?.scrollTo) lenis.scrollTo(saved, { immediate: true });
              else window.scrollTo(0, saved);
            } catch {
              window.scrollTo(0, saved);
            }
          });
        });
      }
      sessionStorage.removeItem("landing-restore");
    } catch {}
  }, [showIntro]);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("skipIntro")) {
      setIntroPhase("done");
      setShowIntro(false);
      try { sessionStorage.removeItem("skipIntro"); } catch {}
      return;
    }
    const HOLD = 2000;
    const ENTER = 800;
    const EXIT = 800;
    const enterTimer = setTimeout(() => setIntroPhase("hold"), ENTER);
    const holdTimer = setTimeout(() => setIntroPhase("exit"), ENTER + HOLD);
    const doneTimer = setTimeout(() => {
      setIntroPhase("done");
    }, ENTER + HOLD + EXIT);
    const hideTimer = setTimeout(() => setShowIntro(false), ENTER + HOLD + EXIT + 50);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showIntro ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showIntro]);

  return (
    <main className="relative min-h-screen bg-[#0a0404] overflow-x-clip [overscroll-behavior:none]">
      {}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-transform duration-[800ms] ${introPhase === "exit" || introPhase === "done" ? "-translate-y-full" : "translate-y-0"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
          aria-hidden={introPhase === "done"}
        >
          <div className="overflow-visible px-2 py-3 -my-3">
            <div className="overflow-hidden px-1 py-2 -my-2">
              <p
                className={`text-[42px] sm:text-[56px] lg:text-[72px] font-black tracking-[-0.04em] text-white leading-none select-none transition-all duration-[800ms] will-change-transform ${introPhase === "enter" ? "translate-y-[110%] opacity-0" : "translate-y-0 opacity-100"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
              >
                RIZAL<span className="align-super text-[0.28em] font-light ml-[0.06em] relative -top-[0.05em] inline-block">®</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <SiteNav />

      {}
      <div className="relative z-10 bg-[#0a0404] shadow-[0_32px_100px_rgba(0,0,0,0.65)]">
      {}
      <section className="relative h-[100svh] min-h-[600px] lg:min-h-[640px] bg-[#0e0505] overflow-hidden grid-lines flex flex-col">
        {}
        <div className="absolute inset-0 lg:left-auto lg:w-[52%] lg:right-0 top-0 bottom-0">
          <Image
            src="/images/hero.webp"
            alt="Rizal hero"
            fill
            priority
            className="object-cover object-[50%_22%] lg:object-[50%_18%] brightness-[1.06] contrast-[1.02]"
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
          {}
          <div className="absolute inset-0 lg:hidden" style={{ background: `linear-gradient(to top, rgba(10,4,4,0.28) 0%, transparent 18%)` }} />
          <div className="absolute inset-0 hidden lg:block" style={{ background: `linear-gradient(to top, rgba(10,4,4,0.14) 0%, transparent 14%)` }} />
          {}
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

        {}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_35%_45%,rgba(255,255,255,0.04),transparent_58%)] z-[1]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay z-[1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        {}
        <div className="relative z-10 flex-1 flex flex-col mx-auto w-full max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pt-[76px] md:pt-[92px]">
          {}
          <div className="pt-10 lg:pt-14">
            <div className="inline-flex items-center gap-3 text-[14px] sm:text-[14px] tracking-[0.16em] uppercase font-mono text-white/60">
              <span>Personal Portfolio</span>
              <span className="h-[1px] w-10 bg-white/25 hidden sm:block" />
              <span className="hidden sm:block w-1 h-1 rounded-full bg-white/60" />
            </div>

            <h1 className="hero-display mt-6 lg:mt-8 text-[66px] sm:text-[92px] md:text-[110px] lg:text-[150px] xl:text-[188px] 2xl:text-[208px]">
              Rizal<span className="align-super text-[0.36em] ml-[0.04em] font-light tracking-[-0.02em]">®</span>
            </h1>

            {}
            <div className="mt-4 lg:mt-6 h-[1px] w-full max-w-[560px] bg-gradient-to-r from-white/[0.09] via-white/[0.05] to-transparent" />
          </div>

          {}
          <div className="flex-1" />

          <div className="pb-8 lg:pb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            {}
            <div className="max-w-[560px]">
              <h2 className="text-[22px] sm:text-[26px] lg:text-[34px] leading-[1.12] tracking-[-0.03em] font-light">
                <span className="text-white">Crafting Web Experiences</span>
                <br />
                <span className="text-white/60">& Logic Solutions</span>
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-white/60 max-w-[46ch]">
                Informatics student - React, Tailwind, Supabase. 12 tools, 9+11 achievements, 4 web projects.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="#projects"
                  className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-black text-[15px] font-medium hover:bg-white/90 transition-colors"
                >
                  View Projects →
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center px-5 py-2.5 rounded-full border border-white/14 text-white/85 text-[15px] hover:bg-white/5 transition-colors"
                >
                  About
                </a>
              </div>
            </div>

            {}
            <div className="hidden lg:flex flex-col items-end gap-[6px] text-right shrink-0 pb-1">
              {navItems.map((item) => (
                <a
                  key={item.n}
                  href={item.href}
                  className="group flex items-center gap-2 text-[14px] font-mono tracking-[0.08em] text-[#F0F3FF]/82 hover:text-white transition-colors"
                >
                  <span className="group-hover:-translate-x-1 transition-transform duration-300">
                    ({item.n}) {item.label}
                  </span>
                </a>
              ))}
              <div className="mt-2 h-[1px] w-20 bg-white/10" />
              <span className="text-[14px] tracking-[0.14em] text-[#F0F3FF]/60 font-mono">©2026 - PENS</span>
            </div>
          </div>
        </div>

        {}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-white/[0.06] z-10" />
      </section>

      {}
      <LatestProject />

      {}
      <div className="h-4 lg:h-6 bg-[#0a0404] relative isolate [transform:translateZ(0)] [backface-visibility:hidden]" aria-hidden />

      {}
      <WhoAmI />

      {}
      <div className="h-4 lg:h-6 bg-[#0a0404] relative isolate [transform:translateZ(0)] [backface-visibility:hidden]" aria-hidden />

      {}
      <ToolsMarquee />

      {}
      <div className="h-4 lg:h-6 bg-[#0a0404] relative isolate [transform:translateZ(0)] [backface-visibility:hidden]" aria-hidden />

      {}
      <WhatCanIDo />

      <div className="h-4 lg:h-6 bg-[#0a0404] relative isolate [transform:translateZ(0)] [backface-visibility:hidden]" aria-hidden />

      <WorkProcess />

      <div className="h-4 lg:h-6 bg-[#0a0404] relative isolate [transform:translateZ(0)] [backface-visibility:hidden]" aria-hidden />

      {/* LOCKED PACKAGE: Contact + RevealFooter — do not separate or edit independently without approval */}
      <section id="contact" className="relative bg-[#0a0404] border-y border-white/[0.06] scroll-mt-[88px] md:scroll-mt-[112px]">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="text-center">
            <p className="text-[15px] lg:text-[16px] font-medium tracking-[0.16em] uppercase text-[#F0F3FF]/82">Email Address</p>
            <a href="mailto:rizalmaulanaairlangga456@gmail.com" className="mt-3 inline-block text-[20px] lg:text-[24px] font-medium tracking-[-0.01em] text-white hover:text-white/80 transition-colors break-all">
              rizalmaulanaairlangga456@gmail.com
            </a>
          </div>
          <div className="text-center">
            <p className="text-[15px] lg:text-[16px] font-medium tracking-[0.16em] uppercase text-[#F0F3FF]/82">Social Links</p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <a href="https://www.instagram.com/a_rizal_i/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-black transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.6"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/rizal-maulana-airlangga-072b21346/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-black transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="mailto:rizalmaulanaairlangga456@gmail.com" aria-label="Email" className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-black transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6.5C4 5.67 4.67 5 5.5 5H18.5C19.33 5 20 5.67 20 6.5V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7L12 12.5L19 7" stroke="currentColor" strokeWidth="1.5"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>

      {}
      <RevealFooter />
    </main>
  );
}

// LOCKED: RevealFooter is paired with Contact — keep together
function RevealFooter() {
  const innerRef = useRef(null);
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const docH = document.documentElement.scrollHeight;
        const vh = window.innerHeight;
        const fh =  Math.min(vh * 0.42, 560);
        const start = docH - vh - fh;
        const end = docH - vh;
        const y = window.scrollY;
        const progress = Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start)));
        const off = (1 - progress) * 92;
        inner.style.transform = `translate3d(0,${off}px,0)`;
        inner.style.willChange = progress < 0.99 ? "transform" : "auto";
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      {}
      <div className="h-[42vh] min-h-[280px] pointer-events-none" aria-hidden />
      <footer className="fixed bottom-0 inset-x-0 z-0 overflow-hidden flex flex-col h-[42vh] min-h-[280px] border-t border-black/10" style={{ backgroundColor: "#C2BFB7", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E")` }}>
        <div ref={innerRef} className="flex-1 relative flex flex-col justify-end px-[1.6%] lg:px-[1%] pb-3 lg:pb-4 pt-6 lg:pt-8 will-change-transform" style={{ transform: "translate3d(0,92px,0)" }}>
          <div className="flex items-end justify-between gap-4">
            <h2 className="hero-display text-[30vw] sm:text-[26vw] lg:text-[18vw] xl:text-[16vw] leading-[0.82] tracking-[-0.06em] select-none pointer-events-none !text-[#0a0404]" style={{ WebkitTextFillColor: "#0a0404", color: "#0a0404" }}>
              RIZAL<span className="align-super text-[0.28em] font-light ml-[0.03em]">®</span>
            </h2>
            <div className="hidden sm:flex flex-col items-end justify-end pb-[1.2vw] lg:pb-[1vw] text-right leading-[0.88] tracking-[-0.04em] font-black text-[#0a0404] shrink-0">
              <span className="text-[10vw] sm:text-[8vw] lg:text-[5.5vw] xl:text-[5vw]">Learning.</span>
              <span className="text-[10vw] sm:text-[8vw] lg:text-[5.5vw] xl:text-[5vw]">Building.</span>
              <span className="text-[10vw] sm:text-[8vw] lg:text-[5.5vw] xl:text-[5vw] text-[#0a0404]/80">Growing.</span>
            </div>
          </div>
          <div className="sm:hidden mt-4 text-left leading-[0.9] tracking-[-0.03em] font-black text-[#0a0404]">
            <span className="block text-[18vw]">Learning.</span>
            <span className="block text-[18vw]">Building.</span>
            <span className="block text-[18vw] text-[#0a0404]/80">Growing.</span>
          </div>
        </div>
      </footer>
    </>
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

  useEffect(() => {
    const container = containerRef.current;
    const circle = cursorRef.current;
    if (!container || !circle) return;
    const originalParent = circle.parentNode;
    document.body.appendChild(circle);
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
      try {
        if (circle.parentNode === document.body) {
          originalParent?.appendChild(circle);
        }
      } catch {}
    };
  }, [projects.length]);

  if (!projects.length) {
    return (
      <section className="relative bg-black border-y border-white/5 py-16 flex items-center justify-center">
        <p className="text-sm font-mono tracking-[0.16em] text-[#F0F3FF]/70">LOADING LATEST PROJECTS...</p>
      </section>
    );
  }
  return (
    <>
      {}
      <style>{`[data-hovered] .project-overlay{background-color:rgba(0,0,0,0.30)!important}[data-hovered] .project-mobile-circle{opacity:1!important}`}</style>
      <div ref={containerRef} id="projects" className="relative cursor-none scroll-mt-[88px] md:scroll-mt-[112px]">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {}
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
  const router = useRouter();
  const ref = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const img = imgRef.current;
    if (!el || !img) return;
    let raf = 0;
    let current = 1.16;
    let target = 1.16;
    img.style.transform = `scale(${current}) translateZ(0)`;
    img.style.backfaceVisibility = "hidden";
    const tick = () => {
      raf = 0;
      current += (target - current) * 0.08;
      img.style.transform = `scale(${current}) translateZ(0)`;
      if (Math.abs(target - current) > 0.0006) {
        raf = requestAnimationFrame(tick);
      } else {
        img.style.willChange = "auto";
      }
    };
    const updateTarget = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const header = 92;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh - header)));
      target = 1.16 - progress * 0.16;
      if (!raf) {
        img.style.willChange = "transform";
        raf = requestAnimationFrame(tick);
      }
    };
    updateTarget();
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        img.style.willChange = "transform";
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
  const slug = project.slug || "";
  const detailHref = slug ? `/work/${slug}` : (project.link_web || project.repo_link || "#");
  const img = project.foto_public_url;

  return (
    <section
      ref={ref}
      data-project-link={detailHref}
      onClick={() => {
        if (slug) {
          try { sessionStorage.setItem("landing-scroll-y", String(window.scrollY)); } catch {}
          router.push(detailHref);
        } else window.open(detailHref, "_blank");
      }}
      className="relative w-full h-[82vh] min-h-[540px] lg:min-h-[620px] bg-black group block cursor-none"
      style={{ margin: 0 }}
    >
      {}
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
      {}
      <div className="project-overlay absolute inset-0 bg-black/28 group-hover:bg-black/36 transition-colors duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-transparent to-transparent" />

      {}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/10" />
      <div className="absolute top-6 lg:top-8 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-[10px] opacity-25">
        {Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="w-[1px] h-[14px] bg-white/40 block" />
        ))}
      </div>
      {}
      <motion.div
        initial={{ x: 22, y: 16, opacity: 0 }}
        whileInView={{ x: 0, y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        className="absolute top-6 lg:top-8 left-[4%] lg:left-[3.5%] z-10 will-change-transform"
      >
        <p className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 backdrop-blur-[10px] px-3.5 py-1.5 text-[14px] font-mono tracking-[0.14em] text-white uppercase shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          {title.split(" ")[0]} <span className="text-white/60">- {year}</span>
        </p>
      </motion.div>

      {}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[3.2%] text-center z-10 pointer-events-none">
        <motion.h2
          initial={{ y: 34, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="text-[36px] sm:text-[52px] lg:text-[68px] xl:text-[80px] font-medium tracking-[-0.04em] leading-[0.9] text-white max-w-[18ch] drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] [text-shadow:0_1px_20px_rgba(0,0,0,0.45)] will-change-transform"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ y: 28, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mt-4 lg:mt-5 inline-flex max-w-[58ch] rounded-[14px] border border-white/10 bg-black/40 backdrop-blur-[12px] px-5 py-3 text-[14px] sm:text-[15px] font-mono tracking-[0.10em] text-white leading-relaxed shadow-[0_8px_32px_rgba(0,0,0,0.38)] will-change-transform"
        >
          {subtitle}
        </motion.p>
      </div>

      {}
      <motion.div
        initial={{ x: 20, y: 14, opacity: 0 }}
        whileInView={{ x: 0, y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
        className="absolute bottom-6 lg:bottom-8 left-[4%] lg:left-[3.5%] z-10 will-change-transform"
      >
        <ul className="flex flex-col gap-[4px] rounded-[12px] border border-white/10 bg-black/30 backdrop-blur-[10px] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          {frameworks.slice(0, 5).map((fw) => (
            <li key={fw} className="text-[14px] sm:text-[15px] font-mono tracking-[0.08em] text-white leading-5 uppercase">
              {fw}
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
        className="absolute bottom-6 lg:bottom-8 right-[4%] lg:right-[3.5%] z-10 will-change-transform"
      >
        <p className="inline-flex rounded-full border border-white/10 bg-black/30 backdrop-blur-[10px] px-3 py-1.5 text-[13px] sm:text-[14px] font-mono tracking-[0.08em] text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]">YR/ {year}</p>
      </motion.div>

      {}
      <div
        className="project-mobile-circle lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[148px] h-[148px] rounded-full bg-[#FF4D2E] flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        <span className="text-[20px] font-black">→</span>
        <span className="text-[13px] font-black tracking-[0.08em] whitespace-nowrap">VIEW CASE STUDY</span>
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
      <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] flex items-center gap-4">
        <span className="text-[18px] lg:text-[20px] font-light tracking-[-0.02em] text-white whitespace-nowrap">{range}</span>
        <div className="flex-1 h-[1px] bg-white/15" />
        <a
          href="#projects"
          className="flex items-center gap-3 group shrink-0"
        >
          <span className="w-10 h-10 rounded-[10px] bg-[#FF4D2E] flex items-center justify-center text-white text-[18px] group-hover:scale-105 transition-transform">→</span>
          <span className="text-[15px] lg:text-[16px] font-medium tracking-[-0.02em] text-white">More Projects</span>
          <sup className="text-[13px] font-mono text-[#F0F3FF]/78 -top-1">{count}</sup>
        </a>
      </div>
    </section>
  );
}

function WhoAmI() {
  return (
    <section id="about" className="relative bg-[#0a0404] py-10 lg:py-20 overflow-hidden isolate [transform:translateZ(0)] scroll-mt-[88px] md:scroll-mt-[104px]">      {}
      <div className="absolute top-0 inset-x-0 h-px bg-white/[0.06]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.04),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1160px] px-[3.2%] md:px-[1.6%] lg:px-[14px]">
        {}
        <p className="text-center text-[14px] lg:text-[15px] font-medium tracking-[0.16em] text-[#F0F3FF]/82 uppercase">
          Who Am I
        </p>
        {}
        <h2 className="mt-3 text-center text-[44px] sm:text-[60px] lg:text-[80px] xl:text-[88px] font-semibold tracking-[-0.04em] leading-[0.95] text-white">
          <span className="inline-flex items-baseline justify-center flex-wrap gap-x-[0.08em]">
            <span>The</span>
            <span
              className="italic font-normal tracking-[-0.02em] ml-[0.06em]"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              human
            </span>
            <span className="ml-[0.08em]">behind</span>
          </span>
          <br />
          <span className="block">all this code</span>
        </h2>

        {}
        <div className="mt-10 lg:mt-14 grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-4 lg:gap-5 items-stretch">
          {}
          <div className="relative rounded-[20px] lg:rounded-[24px] overflow-hidden bg-[#111010] border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)] min-h-[380px] lg:min-h-[520px] flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop"
              alt="Rizal dummy portrait"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-[20px] lg:rounded-[24px] border border-white/[0.06] mix-blend-overlay" />
          </div>

          {}
          <div className="relative rounded-[20px] lg:rounded-[24px] bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.07] shadow-[0_16px_48px_rgba(0,0,0,0.45)] p-6 sm:p-7 lg:p-8 flex flex-col">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-white">About me</p>
            <div className="mt-6 lg:mt-8 space-y-4 text-[18px] lg:text-[20px] leading-[1.75] text-white/60">
              <p>
                I’m Rizal Maulana Airlangga, an IT student and aspiring fullstack developer interested in building modern
                web applications from frontend to backend. I enjoy working with technologies like React, Vue, Tailwind CSS,
                Laravel, Node.js, and ASP.NET to turn ideas into functional digital products.
              </p>
              <p>
                I learn primarily through projects, collaboration, and experimentation—using tools like GitHub, Figma, Notion,
                and AI to improve how I build and solve problems. I’m currently focused on growing my fullstack development
                and Agile teamwork skills while creating digital solutions that are practical, thoughtful, and useful.
              </p>
            </div>
            <div className="flex-1 min-h-[24px]" />
                        <p
              className="mt-8 text-[28px] lg:text-[32px] leading-none text-white select-none"
              style={{ fontFamily: "var(--font-hand), 'Caveat', cursive", fontStyle: "italic", fontWeight: 500 }}
            >
              Rizal Maulana A.
            </p>
          </div>
        </div>
      </div>
      {}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.06] [transform:translateZ(0)]" />
    </section>
  );
}

function ToolsMarquee() {
  const [tools, setTools] = useState([]);
  const [hoveredTool, setHoveredTool] = useState(null);
  const [rowHoverTop, setRowHoverTop] = useState(false);
  const [rowHoverBottom, setRowHoverBottom] = useState(false);
  const topTrackRef = useRef(null);
  const bottomTrackRef = useRef(null);
  const topOffsetRef = useRef(0);
  const bottomOffsetRef = useRef(0);
  const topSpeedRef = useRef(48);
  const bottomSpeedRef = useRef(48);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const hoveredToolRef = useRef(null);
  const rowHoverTopRef = useRef(false);
  const rowHoverBottomRef = useRef(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return;
    const supa = createClient(url, anon);
    supa
      .from("tools")
      .select("tool_id,name,short_desc,logo_public_url,logo_file_name,category")
      .order("tool_id", { ascending: true })
      .then(({ data }) => {
        if (data) setTools(data);
      });
  }, []);

  useEffect(() => { hoveredToolRef.current = hoveredTool; }, [hoveredTool]);
  useEffect(() => { rowHoverTopRef.current = rowHoverTop; }, [rowHoverTop]);
  useEffect(() => { rowHoverBottomRef.current = rowHoverBottom; }, [rowHoverBottom]);

  useEffect(() => {
    if (!tools.length) return;
    const topEl = topTrackRef.current;
    const bottomEl = bottomTrackRef.current;
    if (!topEl || !bottomEl) return;

    const getLoopWidth = (el) => el.scrollWidth / 4;
    const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const init = () => {
      const topLoop = getLoopWidth(topEl);
      const bottomLoop = getLoopWidth(bottomEl);
      topOffsetRef.current = 0;
      bottomOffsetRef.current = -bottomLoop;
      topEl.style.transform = `translate3d(0,0,0)`;
      bottomEl.style.transform = `translate3d(${-bottomLoop}px,0,0)`;
    };
    init();
    const onResize = () => init();
    window.addEventListener("resize", onResize);

    const tick = (now) => {
      if (prefersReduced) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (lastTimeRef.current == null) lastTimeRef.current = now;
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const isMobile = window.innerWidth < 640;
      const normal = isMobile ? 36 : 48; // px/s
      const slow = normal * 0.38;

      const ht = hoveredToolRef.current;
      const rht = rowHoverTopRef.current;
      const rhb = rowHoverBottomRef.current;

      let topTarget;
      if (ht?.startsWith("top-")) topTarget = 0;
      else if (rht) topTarget = slow;
      else topTarget = normal;

      let bottomTarget;
      if (ht?.startsWith("bottom-")) bottomTarget = 0;
      else if (rhb) bottomTarget = slow;
      else bottomTarget = normal;

      topSpeedRef.current += (topTarget - topSpeedRef.current) * 0.12;
      bottomSpeedRef.current += (bottomTarget - bottomSpeedRef.current) * 0.12;
      if (Math.abs(topTarget - topSpeedRef.current) < 0.15) topSpeedRef.current = topTarget;
      if (Math.abs(bottomTarget - bottomSpeedRef.current) < 0.15) bottomSpeedRef.current = bottomTarget;

      const topLoop = getLoopWidth(topEl);
      const bottomLoop = getLoopWidth(bottomEl);

      topOffsetRef.current -= topSpeedRef.current * dt;
      if (topOffsetRef.current <= -topLoop) topOffsetRef.current += topLoop;
      if (topOffsetRef.current > 0) topOffsetRef.current -= topLoop;
      topEl.style.transform = `translate3d(${topOffsetRef.current}px,0,0)`;

      bottomOffsetRef.current += bottomSpeedRef.current * dt;
      if (bottomOffsetRef.current >= 0) bottomOffsetRef.current -= bottomLoop;
      if (bottomOffsetRef.current < -bottomLoop) bottomOffsetRef.current += bottomLoop;
      bottomEl.style.transform = `translate3d(${bottomOffsetRef.current}px,0,0)`;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      lastTimeRef.current = null;
    };
  }, [tools.length]);

  if (!tools.length) {
    return (
      <section id="tools" className="relative bg-[#080405] border-y border-white/[0.06] py-10">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%]">
          <p className="text-sm font-mono tracking-[0.16em] text-[#F0F3FF]/70 animate-pulse">LOADING TOOLS...</p>
        </div>
      </section>
    );
  }

  const mid = Math.ceil(tools.length / 2);
  const topRow = tools.slice(0, mid);
  const bottomRow = tools.slice(mid);
  const dupTop = [...topRow, ...topRow, ...topRow, ...topRow];
  const dupBottom = [...bottomRow, ...bottomRow, ...bottomRow, ...bottomRow];

  return (
    <section id="tools" className="relative bg-[#080405] border-y border-white/[0.06] overflow-hidden isolate [transform:translateZ(0)] [backface-visibility:hidden] scroll-mt-[88px] md:scroll-mt-[104px]" style={{ contain: "layout style" }}>
      {}
      <div className="relative z-20 mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pt-10 lg:pt-12 pb-6 lg:pb-8 flex flex-col items-center text-center gap-5">
        <div className="flex flex-col items-center">
          <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.16em] text-[#F0F3FF]/85 uppercase flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4D2E] shadow-[0_0_12px_rgba(255,77,46,0.6)]" />
            Stack • {tools.length} tools
          </p>
          <h2 className="mt-3 text-[36px] sm:text-[44px] lg:text-[56px] font-light tracking-[-0.04em] leading-[0.9] text-white">
            Tools I <span className="font-black tracking-[-0.06em]">rely on</span>
          </h2>
        </div>
        <p className="hidden md:block text-[14px] lg:text-[15px] font-mono tracking-[0.08em] text-[#F0F3FF]/60 uppercase max-w-[48ch] leading-relaxed">
          Hover bar to slow • hover icon to pause & read
        </p>
      </div>

      <div className="relative z-30 pb-8 lg:pb-10 space-y-3 overflow-visible isolate" style={{ contain: "layout style" }}>
        {}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-[6%] lg:w-[10%] bg-gradient-to-r from-[#080405] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[6%] lg:w-[10%] bg-gradient-to-l from-[#080405] to-transparent" />
        </div>

        {}
        <div
          className="marquee-row marquee-row--top relative overflow-visible py-3 group/row isolate"
          onMouseEnter={() => setRowHoverTop(true)}
          onMouseLeave={() => setRowHoverTop(false)}
        >
          <div
            ref={topTrackRef}
            className="marquee-track flex w-max items-center gap-3 lg:gap-4 [backface-visibility:hidden] [transform:translateZ(0)]"
            style={{ transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}
          >
            {dupTop.map((t, i) => (
              <div
                key={`top-${t.tool_id}-${i}`}
                className="tool-card group/card relative shrink-0"
                onMouseEnter={() => setHoveredTool(`top-${i}`)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className="relative w-[76px] h-[76px] lg:w-[88px] lg:h-[88px] rounded-[18px] lg:rounded-[20px] bg-white/[0.035] border border-white/[0.07] backdrop-blur-[8px] flex items-center justify-center p-[14px] lg:p-[16px] overflow-hidden transition-all duration-300 group-hover/card:bg-white/[0.08] group-hover/card:border-white/15 group-hover/card:scale-[1.04] group-hover/card:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.08)_inset]">
                  <div className="absolute inset-0 rounded-[18px] lg:rounded-[20px] bg-gradient-to-b from-white/[0.06] to-transparent opacity-60 pointer-events-none" />
                  <div className="absolute inset-0 rounded-[18px] lg:rounded-[20px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_70%)] pointer-events-none" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.logo_public_url}
                    alt={t.name}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="relative z-10 w-full h-full object-contain select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                  />
                </div>
                {}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+18px)] z-30 w-[330px] lg:w-[380px] max-w-[calc(100vw-32px)] pointer-events-none transition-all duration-200 ${hoveredTool === `top-${i}` ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
                >
                  <div className="relative rounded-[20px] border border-white/10 bg-[#111010] shadow-[0_16px_48px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.06)_inset] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                    <div className="relative p-5 lg:p-6">
                      <div className="flex items-center gap-4">
                        <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-[16px] lg:rounded-[18px] bg-white/[0.06] border border-white/10 flex items-center justify-center p-2.5 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.logo_public_url} alt="" className="w-full h-full object-contain" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[20px] lg:text-[22px] font-semibold tracking-[-0.02em] text-white leading-tight">{t.name}</p>
                          <p className="mt-1.5 text-[15px] lg:text-[16px] font-mono tracking-[0.08em] text-[#F0F3FF]/78">{t.category || "Lainnya"}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-[16px] lg:text-[17px] leading-[1.65] text-white/70 line-clamp-3">{t.short_desc}</p>
                    </div>
                  </div>
                  <div className="mx-auto -mt-[1px] w-5 h-5 rotate-45 bg-[#111010] border-r border-b border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.25)]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div
          className="marquee-row marquee-row--bottom relative overflow-visible py-3 group/row isolate"
          onMouseEnter={() => setRowHoverBottom(true)}
          onMouseLeave={() => setRowHoverBottom(false)}
        >
          <div
            ref={bottomTrackRef}
            className="marquee-track flex w-max items-center gap-3 lg:gap-4 [backface-visibility:hidden] [transform:translateZ(0)]"
            style={{ transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}
          >
            {dupBottom.map((t, i) => (
              <div
                key={`bottom-${t.tool_id}-${i}`}
                className="tool-card group/card relative shrink-0"
                onMouseEnter={() => setHoveredTool(`bottom-${i}`)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className="relative w-[76px] h-[76px] lg:w-[88px] lg:h-[88px] rounded-[18px] lg:rounded-[20px] bg-white/[0.035] border border-white/[0.07] backdrop-blur-[8px] flex items-center justify-center p-[14px] lg:p-[16px] overflow-hidden transition-all duration-300 group-hover/card:bg-white/[0.08] group-hover/card:border-white/15 group-hover/card:scale-[1.04] group-hover/card:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.08)_inset]">
                  <div className="absolute inset-0 rounded-[18px] lg:rounded-[20px] bg-gradient-to-b from-white/[0.06] to-transparent opacity-60 pointer-events-none" />
                  <div className="absolute inset-0 rounded-[18px] lg:rounded-[20px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_70%)] pointer-events-none" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.logo_public_url}
                    alt={t.name}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="relative z-10 w-full h-full object-contain select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                  />
                </div>
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+18px)] z-30 w-[330px] lg:w-[380px] max-w-[calc(100vw-32px)] pointer-events-none transition-all duration-200 ${hoveredTool === `bottom-${i}` ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
                >
                  <div className="relative rounded-[20px] border border-white/10 bg-[#111010] shadow-[0_16px_48px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.06)_inset] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                    <div className="relative p-5 lg:p-6">
                      <div className="flex items-center gap-4">
                        <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-[16px] lg:rounded-[18px] bg-white/[0.06] border border-white/10 flex items-center justify-center p-2.5 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.logo_public_url} alt="" className="w-full h-full object-contain" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[20px] lg:text-[22px] font-semibold tracking-[-0.02em] text-white leading-tight">{t.name}</p>
                          <p className="mt-1.5 text-[15px] lg:text-[16px] font-mono tracking-[0.08em] text-[#F0F3FF]/78">{t.category || "Lainnya"}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-[16px] lg:text-[17px] leading-[1.65] text-white/70 line-clamp-3">{t.short_desc}</p>
                    </div>
                  </div>
                  <div className="mx-auto -mt-[1px] w-5 h-5 rotate-45 bg-[#111010] border-r border-b border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.25)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media (prefers-reduced-motion: reduce) { .marquee-track { transform: none !important; } }`}</style>
    </section>
  );
}

function WhatCanIDo() {
  const [hovered, setHovered] = useState(null);

  const velocity = useRef({ x: 0, y: 0, t: 0, speed: 0 });
  const pendingTimer = useRef(null);
  const pendingIndex = useRef(null);

  useEffect(() => {
    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, []);

  const isCoarsePointer = () =>
    typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches;
  const pointerSpeed = () => {
    const v = velocity.current;
    if (!v.t || performance.now() - v.t > 130) return 0;
    return v.speed;
  };
  const recordMove = (e) => {
    const now = performance.now();
    const v = velocity.current;
    if (v.t) {
      const dt = Math.max(1, now - v.t);
      const s = (Math.hypot(e.clientX - v.x, e.clientY - v.y) / dt) * 1000;
      v.speed = v.speed * 0.6 + s * 0.4;
    }
    v.x = e.clientX;
    v.y = e.clientY;
    v.t = now;
  };
  const openRow = (i) => {
    if (isCoarsePointer()) return;
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    pendingIndex.current = null;
    if (pointerSpeed() < 1000) {
      setHovered(i);
      return;
    }
    pendingIndex.current = i;
    pendingTimer.current = setTimeout(() => {
      pendingTimer.current = null;
      const target = pendingIndex.current;
      pendingIndex.current = null;
      setHovered(target);
    }, 110);
  };
  const handleRowEnd = (e) => {
    if (isCoarsePointer()) return;
    if (typeof e?.clientX === "number" && typeof e?.clientY === "number" && typeof document?.elementFromPoint === "function") {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el instanceof Element && el.closest?.("[data-svc-row]")) return;
    }
    const rt = e?.relatedTarget;
    if (rt instanceof Element && rt.closest?.("[data-svc-row]")) return;
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    pendingIndex.current = null;
    setHovered(null);
  };
  const toggleRow = (i) => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    pendingIndex.current = null;
    setHovered((cur) => (cur === i ? null : i));
  };

  const services = [
    {
      num: "01",
      title: "Frontend Development",
      desc: "Crafting fast and responsive interfaces with Next.js, React and Tailwind for clean and performant web experiences.",
      tags: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
      accent: "from-[#1a1a1a] to-[#2a1010]",
      imgFromX: -32,
    },
    {
      num: "02",
      title: "Mobile Development",
      desc: "Cross platform mobile apps with Flutter and React Native, smooth native feel experiences on Android with clean state management.",
      tags: ["Flutter", "React Native", "Expo", "Dart"],
      accent: "from-[#0f1a2a] to-[#102a1a]",
      imgFromX: 32,
    },
    {
      num: "03",
      title: "Backend Development",
      desc: "Scalable APIs and server logic with Node.js, Supabase and ASP.NET Core, auth, REST and realtime handled with clean and maintainable architecture.",
      tags: ["Node.js", "ASP.NET Core", "Supabase", "REST API"],
      accent: "from-[#1a102a] to-[#2a1a10]",
      imgFromX: -32,
    },
    {
      num: "04",
      title: "Database Management",
      desc: "Postgres schema design, migrations, RLS and Storage, clean data modeling and optimized queries for reliable performance.",
      tags: ["PostgreSQL", "Migrations", "RLS Policies", "Storage"],
      accent: "from-[#101a1a] to-[#1a2a2a]",
      imgFromX: 32,
    },
  ];

  return (
    <section id="services" className="relative bg-black border-y border-white/[0.06] scroll-mt-[88px] md:scroll-mt-[128px]">
            <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pt-10 lg:pt-14 pb-6 lg:pb-8 flex flex-col items-center text-center gap-5">
        <div className="flex flex-col items-center">
          <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.16em] text-white/60 uppercase flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4D2E]" /> Services
          </p>
          <h2 className="mt-3 text-[44px] sm:text-[60px] lg:text-[80px] xl:text-[88px] font-black tracking-[-0.06em] leading-[0.9] text-white">
            What can I do?
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pb-6 lg:pb-8">
        {}
        <div className="border-t border-white/[0.28]" onMouseMove={recordMove}>
          {services.map((item, i) => {
            const isHovered = hovered === i;
            return (
              <motion.div
                key={item.num}
                data-svc-row={item.num}
                onHoverStart={() => openRow(i)}
                onHoverEnd={handleRowEnd}
                onFocus={() => openRow(i)}
                onBlur={handleRowEnd}
                onClick={() => toggleRow(i)}
                role="button"
                tabIndex={0}
                aria-expanded={isHovered}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleRow(i)}
                className="border-b border-white/[0.26] cursor-pointer overflow-hidden"
              >
                                <div className="hidden lg:block">
                  {}
                  <div className="flex items-center gap-8 xl:gap-12 px-[0.5%]">
                    {}
                    <div className="flex items-center gap-10 xl:gap-16 shrink-0">
                       {}
                      <div className="flex items-center shrink-0 h-[100px] xl:h-[110px] w-[170px] xl:w-[210px]">
                        <motion.span
                          animate={{
                            fontSize: isHovered ? "120px" : "28px",
                          }}
                          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                          className="block font-mono tracking-[-0.02em] leading-none select-none shrink-0 whitespace-nowrap"
                          style={{
                            color: "rgba(255,255,255,0.42)",
                            fontWeight: isHovered ? 900 : 500,
                            lineHeight: 1,
                          }}
                        >
                          {item.num}
                          <span className="text-[#FF3B30]">.</span>
                        </motion.span>
                      </div>

                      {}
                      <motion.div
                        initial={false}
                        animate={{
                          height: isHovered ? "auto" : 0,
                          opacity: isHovered ? 1 : 0,
                        }}
                        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                        className="overflow-hidden shrink-0 my-[18px] w-[440px] xl:w-[560px] rounded-[20px]"
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isHovered ? 1 : 0.82,
                            x: isHovered ? 0 : item.imgFromX,
                            y: isHovered ? 0 : 8,
                          }}
                          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                          className={`relative w-[440px] xl:w-[560px] h-[300px] xl:h-[380px] rounded-[20px] overflow-hidden bg-gradient-to-br ${item.accent} border border-white/[0.06] flex items-center justify-center ${!isHovered ? "pointer-events-none" : ""}`}
                        >
                        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                        {item.num === "01" && <FrontendVisual />}
                        {item.num === "02" && <MobileVisual />}
                        {item.num === "03" && <BackendVisual />}
                        {item.num === "04" && <DatabaseVisual />}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[13px] font-mono tracking-[0.14em] text-white/70 uppercase bg-black/35 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
                            0{item.num.slice(1)} • {item.title.split(" ")[0]}
                          </span>
                          <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-[13px]">→</span>
                        </div>
                      </motion.div>
                      </motion.div>
                    </div>

                    {}
                    <div className="flex-1 min-w-0 pl-8 xl:pl-12 flex flex-col justify-center py-[18px]">
                      {}
                      <motion.div
                        animate={{
                          height: isHovered ? 0 : 120,
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
                        <span className="block text-[30px] xl:text-[34px] font-semibold tracking-[-0.025em] text-white/90 text-left">
                          {item.title}
                        </span>
                      </motion.div>

                      {}
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
                          <h3 className="text-[40px] xl:text-[48px] font-bold tracking-[-0.04em] leading-[0.95] text-white">
                            {item.title}
                          </h3>
                          <p className="mt-4 text-[17px] xl:text-[19px] leading-relaxed text-[#F0F3FF]/82 max-w-[46ch]">{item.desc}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[15px] font-medium tracking-[-0.01em] text-white/70">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                                <div className="lg:hidden">
                  {}
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
                        animate={{ fontSize: isHovered ? "68px" : "26px" }}
                        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                        className="shrink-0 font-mono tracking-[-0.02em] leading-none select-none"
                        style={{
                          color: "rgba(255,255,255,0.42)",
                          fontWeight: isHovered ? 900 : 500,
                          lineHeight: 1,
                        }}
                      >
                        {item.num}
                        <span className="text-[#FF3B30]">.</span>
                      </motion.span>
                      <span className="text-[24px] font-semibold tracking-[-0.02em] text-white/90 text-right max-w-[60%] leading-tight">
                        {item.title}
                      </span>
                    </div>
                  </motion.div>

                  {}
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
                        <span className="text-[14px] font-mono tracking-[0.08em] text-[#F0F3FF]/75">
                          {item.num}
                          <span className="text-[#FF3B30]">.</span>
                        </span>
                      </div>
                      <div className={`relative w-full h-[250px] rounded-[14px] overflow-hidden bg-gradient-to-br ${item.accent} border border-white/[0.06] flex items-center justify-center`}>
                        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                        {item.num === "01" && <FrontendVisual />}
                        {item.num === "02" && <MobileVisual />}
                        {item.num === "03" && <BackendVisual />}
                        {item.num === "04" && <DatabaseVisual />}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[13px] font-mono tracking-[0.14em] text-white/70 uppercase bg-black/35 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
                            0{item.num.slice(1)} • {item.title.split(" ")[0]}
                          </span>
                          <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-[13px]">→</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-[30px] font-bold tracking-[-0.04em] leading-[0.95] text-white">{item.title}</h3>
                        <p className="mt-3 text-[16px] leading-relaxed text-[#F0F3FF]/82">{item.desc}</p>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[15px] font-medium tracking-[-0.01em] text-white/70">
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
        <p className="mt-4 text-[14px] font-mono tracking-[0.08em] text-white/20">Hover any row to reveal</p>
      </div>
    </section>
  );
}

function WorkProcess() {
  const wrapRef = useRef(null);
  const [scrub, setScrub] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(rm.matches);
      setScrub(mq.matches && !rm.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    rm.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      rm.removeEventListener("change", sync);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const progress = scrollYProgress;

  const steps = [
    {
      num: "01",
      title: "Discovery & Planning",
      desc: "I start by understanding your goals, audience, and scope, then break the work into clear milestones.",
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      alt: "Planning session with laptop and notes",
    },
    {
      num: "02",
      title: "Design & Prototype",
      desc: "Wireframes and interface drafts, iterated quickly until the flow feels right on every screen.",
      img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
      alt: "Interface design workspace",
    },
    {
      num: "03",
      title: "Build & Integrate",
      desc: "Frontend, backend, and database built as one system with clean and maintainable code.",
      img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      alt: "Code editor with project source",
    },
    {
      num: "04",
      title: "Launch & Support",
      desc: "Deployed, tested, and handed over with notes, plus fixes and improvements after launch.",
      img: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80",
      alt: "Rocket launching at liftoff",
    },
  ];

  return (
    <section id="process" className="relative bg-[#0a0404] border-y border-white/[0.06] scroll-mt-[88px] md:scroll-mt-[112px]">
      <div ref={wrapRef} className="relative xl:h-[280vh]">
        <div className="xl:sticky xl:top-0 xl:h-screen xl:overflow-hidden flex flex-col justify-center xl:justify-start py-10 xl:py-0 xl:pt-[104px]">
      <div className="mx-auto w-full max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pt-10 lg:pt-14 xl:pt-6 pb-6 lg:pb-8 xl:pb-4 flex flex-col items-center text-center gap-5">
        <div className="flex flex-col items-center">
          <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.16em] text-[#F0F3FF]/85 uppercase flex items-center justify-center gap-2">
            <span className="text-[#FF4D2E]" aria-hidden>✦</span> Work Process
          </p>
          <h2 className="mt-3 text-[44px] sm:text-[60px] lg:text-[80px] xl:text-[72px] font-black tracking-[-0.06em] leading-[0.9] text-white">
            FROM VISION TO REALITY
          </h2>
        </div>
        <p className="hidden md:block text-[14px] font-mono tracking-[0.12em] text-[#F0F3FF]/60 uppercase max-w-[48ch] leading-relaxed">
          4 steps, from first idea to launched product
        </p>
      </div>

      <div className="mx-auto w-full max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] pb-10 lg:pb-14 xl:pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {steps.map((s, i) => (
            <StepCard key={s.num} s={s} i={i} progress={progress} scrub={scrub} reduced={reduced} />
          ))}
        </div>
      </div>
        </div>
      </div>
    </section>
  );
}

const CARD_DEF = [
  { start: 0.0, revealEnd: 0.3, finalStart: 0.3, end: 0.3, fromY: 200, midY: 0, restY: 0 },
  { start: 0.12, revealEnd: 0.45, finalStart: 0.68, end: 0.94, fromY: 300, midY: 48, restY: 0 },
  { start: 0.28, revealEnd: 0.62, finalStart: 0.62, end: 0.62, fromY: 320, midY: 0, restY: 0 },
  { start: 0.42, revealEnd: 0.68, finalStart: 0.68, end: 0.94, fromY: 480, midY: 48, restY: 0 },
];
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function StepCard({ s, i, progress, scrub, reduced }) {
  const def = CARD_DEF[i];
  const t = useTransform(progress, [def.start, def.end], [0, 1]);
  const span = def.end - def.start;
  const j1 = span > 0 ? (def.revealEnd - def.start) / span : 1;
  const j2 = span > 0 ? (def.finalStart - def.start) / span : 1;
  const y = useTransform(t, (v) => {
    const c = clamp01(v);
    if (c <= j1) {
      const k = j1 > 0 ? clamp01(c / j1) : 1;
      return def.fromY + (def.midY - def.fromY) * easeOutCubic(k);
    }
    if (c <= j2) return def.midY;
    const k = clamp01((c - j2) / (1 - j2));
    return def.midY + (def.restY - def.midY) * k;
  });
  const opacity = useTransform(t, (v) => clamp01(clamp01(v) / (0.35 * (j1 > 0 ? j1 : 1))));
  if (!scrub) {
    return (
      <motion.article
        initial={reduced ? { opacity: 0 } : { y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : i * 0.12 }}
        className="group relative rounded-[20px] bg-[#171414] border border-white/[0.08] p-5 lg:p-6 flex flex-col hover:border-white/[0.16] transition-colors duration-300"
      >
        <CardBody s={s} />
      </motion.article>
    );
  }
  return (
    <motion.article
      style={{ y, opacity }}
      className="group relative rounded-[20px] bg-[#171414] border border-white/[0.08] p-5 lg:p-6 flex flex-col hover:border-white/[0.16] transition-colors duration-300 will-change-transform"
    >
      <CardBody s={s} />
    </motion.article>
  );
}

function CardBody({ s }) {
  return (
    <>
              <span aria-hidden className="absolute -top-[1px] left-8 h-[6px] w-[60px] rounded-b-[3px] bg-[#FF4D2E]" />
              <div className="flex items-baseline gap-3">
                <span className="text-[14px] font-mono tracking-[0.08em] text-[#F0F3FF]/60 shrink-0">{"//"}{s.num}</span>
                <h3 className="text-[28px] lg:text-[32px] font-semibold tracking-[-0.02em] text-white leading-[1.1]">{s.title}</h3>
              </div>
              <div className="my-4 h-px bg-white/[0.08]" aria-hidden />
              <div className="relative h-[280px] lg:h-[300px] rounded-[14px] overflow-hidden border border-white/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.img}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" aria-hidden />
                <div className="absolute inset-x-3 bottom-3 rounded-[14px] border border-white/[0.16] bg-black/45 backdrop-blur-[16px] shadow-[0_12px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.10] to-transparent pointer-events-none" aria-hidden />
                  <p className="relative p-4 text-[17px] lg:text-[18px] leading-[1.6] text-white/85">{s.desc}</p>
                </div>
              </div>
    </>
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
          <div className="flex items-center gap-1 text-[9px] font-mono text-[#F0F3FF]/78">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D2E]" /> app/page.tsx
          </div>
          <div className="mt-1.5 flex gap-1">
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[8px] font-mono text-white/80">page.tsx</span>
            <span className="rounded px-1.5 py-0.5 text-[8px] font-mono text-white/35">layout.tsx</span>
            <span className="rounded px-1.5 py-0.5 text-[8px] font-mono text-white/35">globals.css</span>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-[72%] rounded bg-[#7DD3FC]/70" />
            <div className="h-1.5 w-full rounded bg-white/15" />
            <div className="h-1.5 w-[88%] rounded bg-white/10" />
            <div className="h-1.5 w-[62%] rounded bg-[#A5B4FC]/50" />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <div className="h-[28px] rounded bg-white/90 flex items-center justify-center text-[9px] font-bold text-black">UI Card</div>
            <div className="h-[28px] rounded bg-white/10 border border-white/10" />
          </div>
          <div className="mt-auto flex gap-1 items-center">
            <span className="h-1.5 w-8 rounded-full bg-[#FF4D2E]/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/10" />
            <span className="ml-auto rounded-full bg-emerald-400/15 border border-emerald-400/20 px-1.5 py-0.5 text-[8px] font-mono text-emerald-300">Perf 98 • LCP 0.9s</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex-1 rounded-[10px] bg-white p-2.5 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <div className="w-6 h-6 rounded-full bg-[#0a0404] flex items-center justify-center text-[8px] font-black text-white">R</div>
            <div className="mt-2 h-1.5 w-3/4 rounded bg-black/10" />
            <div className="mt-1 h-1 w-full rounded bg-black/5" />
            <div className="mt-1 h-1 w-5/6 rounded bg-black/5" />
            <div className="mt-auto h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold">View →</div>
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
            <span className="text-[8px] font-mono text-[#F0F3FF]/78">9:41</span>
            <span className="flex gap-0.5"><span className="w-2 h-1 rounded bg-white/60" /><span className="w-1 h-1 rounded-full bg-white/30" /></span>
          </div>
          <div className="px-2.5 pt-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#02569B] flex items-center justify-center text-[9px] font-black text-white">F</span>
            <div className="flex-1">
              <div className="h-1 w-8 rounded bg-white/80" />
              <div className="mt-1 h-1 w-5 rounded bg-white/20" />
            </div>
            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/60">◈</span>
          </div>
          <div className="mt-2 mx-2 rounded-[10px] bg-white p-2">
            <div className="h-1.5 w-3/4 rounded bg-black/10" />
            <div className="mt-1 h-1 w-full rounded bg-black/5" />
            <div className="mt-2 h-10 rounded bg-[#0a0404]/5 border border-black/5 flex items-end justify-center gap-1 px-2 pb-1.5 pt-1.5">
              <span className="w-1.5 rounded bg-[#02569B]/50" style={{ height: "40%" }} />
              <span className="w-1.5 rounded bg-[#02569B]/70" style={{ height: "70%" }} />
              <span className="w-1.5 rounded bg-[#02569B]" style={{ height: "100%" }} />
              <span className="w-1.5 rounded bg-[#02569B]/70" style={{ height: "55%" }} />
              <span className="w-1.5 rounded bg-[#02569B]/50" style={{ height: "85%" }} />
            </div>
            <div className="mt-2 h-4 rounded-full bg-black flex items-center justify-center text-[8px] font-bold text-white">Open App</div>
          </div>
          <div className="mt-1.5 mx-2 flex items-center justify-around">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          </div>
          <div className="mt-auto mx-auto mb-1.5 w-8 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="w-[72px] rounded-[10px] bg-white/10 backdrop-blur border border-white/10 p-2">
            <div className="text-[8px] font-mono tracking-[0.08em] text-[#F0F3FF]/82 uppercase">Flutter</div>
            <div className="mt-1 h-1 w-full rounded bg-white/20" />
            <div className="mt-1 h-1 w-2/3 rounded bg-white/20" />
          </div>
          <div className="w-[72px] rounded-[10px] bg-white p-2 shadow-md">
            <div className="text-[8px] font-mono tracking-[0.08em] text-black/40 uppercase">React Native</div>
            <div className="mt-1 flex gap-1">
              <span className="h-1.5 flex-1 rounded bg-black" />
              <span className="h-1.5 flex-1 rounded bg-black/10" />
            </div>
          </div>
          <div className="w-[72px] rounded-[10px] bg-white/10 backdrop-blur border border-white/10 p-2">
            <div className="flex rounded-full bg-black/40 p-0.5">
              <span className="flex-1 rounded-full bg-white text-[7px] font-bold text-black text-center py-0.5">iOS</span>
              <span className="flex-1 text-[7px] font-bold text-white/50 text-center py-0.5">Andr</span>
            </div>
            <div className="mt-1.5 text-[8px] font-mono text-emerald-300">Hot reload 240ms</div>
          </div>
          <div className="w-[72px] rounded-full bg-[#FF4D2E] px-2 py-1.5 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[8px] font-bold tracking-[0.08em] text-white">LIVE PREVIEW</span>
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
        <span className="text-[9px] font-mono tracking-[0.12em] text-[#F0F3FF]/78 uppercase">API Gateway - Scalable</span>
        <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> live</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <span className="rounded bg-emerald-400/15 border border-emerald-400/20 px-1.5 py-0.5 text-[8px] font-mono text-emerald-300">GET 200</span>
        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[8px] font-mono text-white/60">POST 201</span>
        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[8px] font-mono text-white/60">JWT Auth</span>
        <span className="ml-auto text-[8px] font-mono text-white/40">realtime • 3 listeners</span>
      </div>
      <div className="mt-3 flex-1 flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <span className="w-8 h-8 rounded-[9px] bg-white flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0404" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9s-1.4 6.4-3.9 9c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z" /></svg>
          </span>
          <span className="text-[8px] font-mono text-[#F0F3FF]/82">Client</span>
        </div>
        <span className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-white/20 relative"><span className="absolute right-0 -top-[3px] text-[9px] text-[#F0F3FF]/82">▸</span></span>
        <div className="flex flex-col gap-1.5">
          <div className="w-[92px] rounded-[9px] bg-[#68A063] px-2 py-1.5 flex items-center gap-1.5 border border-white/10 shadow">
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[9px] font-black text-[#68A063]">N</span>
            <div><div className="text-[9px] font-bold leading-none text-white">Node.js</div><div className="text-[8px] font-mono leading-none text-white/70">REST - Auth</div></div>
            <span className="ml-auto text-[9px] text-white/80">●</span>
          </div>
          <div className="w-[92px] rounded-[9px] bg-[#512BD4] px-2 py-1.5 flex items-center gap-1.5 border border-white/10 shadow">
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[8px] font-black text-[#512BD4]">.NET</span>
            <div><div className="text-[9px] font-bold leading-none text-white">ASP.NET Core</div><div className="text-[8px] font-mono leading-none text-white/70">API - Clean Arch</div></div>
            <span className="ml-auto text-[9px] text-white/80">●</span>
          </div>
        </div>
        <span className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-white/20 relative"><span className="absolute right-0 -top-[3px] text-[9px] text-[#F0F3FF]/82">▸</span></span>
        <div className="flex flex-col items-center gap-1">
          <span className="w-8 h-8 rounded-[9px] bg-[#3ECF8E] flex items-center justify-center text-[12px] font-black text-white">S</span>
          <span className="text-[8px] font-mono text-[#F0F3FF]/82">Supabase</span>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1.5 rounded-full bg-black/30 border border-white/10 px-2 py-1">
        <span className="text-[8px] font-mono text-[#F0F3FF]/78">GET</span>
        <span className="text-[8px] font-mono text-white/70">/api/v1/projects</span>
        <span className="ml-auto text-[8px] font-mono text-emerald-300">200 OK - 42ms</span>
      </div>
    </div>
  );
}

function DatabaseVisual() {
  return (
    <div className="absolute inset-0 p-3 lg:p-4 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[9px] font-mono tracking-[0.08em] text-[#F0F3FF]/82 uppercase"><span className="w-4 h-4 rounded bg-[#336791] flex items-center justify-center text-[9px] font-black text-white">◈</span> PostgreSQL - RLS Enabled</span>
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-emerald-300">migrated</span>
      </div>
      <div className="mt-2.5 flex-1 grid grid-cols-[1.15fr_0.85fr] gap-2.5">
        <div className="rounded-[10px] bg-black/40 border border-white/10 overflow-hidden flex flex-col">
          <div className="h-5 bg-white/5 flex items-center px-2 gap-1">
            <span className="text-[8px] font-mono text-white/60">proyek_web</span>
            <span className="ml-auto text-[8px] font-mono px-1 py-0.5 rounded bg-white/10 text-[#F0F3FF]/82">12 rows</span>
          </div>
          <div className="px-2 py-1.5 grid grid-cols-[16px_1fr_36px] gap-1 text-[8px] font-mono text-[#F0F3FF]/70 uppercase tracking-[0.06em]">
            <span>#</span><span>name</span><span className="text-right">date</span>
          </div>
          <div className="px-1 space-y-0.5">
            {[
              ["1", "E Commerce", "2025"],
              ["2", "SIPENS", "2024"],
              ["3", "Portfolio", "2026"],
            ].map((r) => (
              <div key={r[0]} className="grid grid-cols-[16px_1fr_36px] gap-1 items-center rounded bg-white/5 px-1 py-1 text-[8px] font-mono text-white/70">
                <span className="text-[#F0F3FF]/70">{r[0]}</span><span className="truncate">{r[1]}</span><span className="text-right text-[#F0F3FF]/78">{r[2]}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto h-5 bg-white/5 flex items-center px-2 gap-1 text-[8px] font-mono text-[#F0F3FF]/78">
            <span className="w-1 h-1 rounded-full bg-emerald-400" /> RLS - Storage - Realtime
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="rounded-[10px] bg-white p-2">
            <div className="text-[8px] font-mono tracking-[0.08em] text-black/40 uppercase">Schema</div>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-1 text-[8px] font-mono"><span className="w-1 h-1 rounded-full bg-[#FF4D2E]" /> id <span className="ml-auto text-black/30">uuid PK</span></div>
              <div className="flex items-center gap-1 text-[8px] font-mono"><span className="w-1 h-1 rounded-full bg-[#336791]" /> name <span className="ml-auto text-black/30">text</span></div>
              <div className="flex items-center gap-1 text-[8px] font-mono"><span className="w-1 h-1 rounded-full bg-emerald-500" /> date <span className="ml-auto text-black/30">timestamptz</span></div>
            </div>
            <div className="mt-2 h-1 w-full rounded bg-black/5" />
            <div className="mt-1 h-1 w-2/3 rounded bg-black/5" />
          </div>
          <div className="rounded-[10px] bg-[#0a0404] border border-white/10 p-2">
            <div className="text-[8px] font-mono text-[#F0F3FF]/78">Query</div>
            <div className="mt-1 font-mono text-[8px] leading-relaxed text-white/70">
              SELECT *<br />FROM proyek_web<br />ORDER BY date DESC
            </div>
            <div className="mt-1.5 text-[8px] font-mono text-emerald-300">↳ 42ms - indexed</div>
          </div>
        </div>
      </div>
      <div className="mt-2 hidden lg:flex items-center gap-1.5 rounded-[10px] bg-black/40 border border-white/10 px-2 py-1.5">
        <span className="text-[8px] font-mono text-white/40">migration</span>
        <span className="text-[8px] font-mono text-white/80 truncate">20260930_add_frameworks.sql</span>
        <span className="text-[8px] font-mono text-white/40 truncate">bucket covers • public</span>
        <span className="ml-auto shrink-0 text-[8px] font-mono text-emerald-300">applied</span>
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
      <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] py-16 lg:py-20">
        <div className="flex items-start justify-between gap-8">
          <div className="flex gap-4">
            <span className="text-[13px] font-mono tracking-[0.12em] text-[#F0F3FF]/70 mt-1">({k})</span>
            <div>
              <h3 className="text-[26px] lg:text-[34px] tracking-[-0.03em] font-light">{title}</h3>
              <p className="mt-2 text-sm text-[#F0F3FF]/82 max-w-[44ch]">{desc}</p>
              <p className="mt-4 text-sm font-mono text-[#F0F3FF]/60">
                Supabase → <code className="text-[#F0F3FF]/78">select * from {id}</code> (anon read)
              </p>
            </div>
          </div>
          <span className="hidden md:block text-[13px] font-mono text-white/20">→</span>
        </div>
      </div>
    </section>
  );
}
