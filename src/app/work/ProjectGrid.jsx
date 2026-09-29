"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ProjectGrid({ projects }) {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const [cursorActive, setCursorActive] = useState(false);

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
      updateHoveredCard(inside);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onEnter = () => { active = true; setCursorActive(true); };
    const onLeave = () => {
      active = false;
      setCursorActive(false);
      updateHoveredCard(false);
    };
    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, []);

  if (!projects?.length) {
    return <p className="text-[13px] font-mono tracking-[0.08em] text-[#F0F3FF]/60">No projects yet.</p>;
  }

  return (
    <>
      <style>{`[data-hovered] .project-overlay{background-color:rgba(0,0,0,0.18)!important}[data-hovered] .project-zoom{transform:scale(1.12)!important}[data-hovered] .project-mobile-circle{opacity:1!important}`}</style>
      <div ref={containerRef} className="relative cursor-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 lg:gap-x-5 gap-y-12 lg:gap-y-16">
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              data-project-link={`/work/${p.slug}`}
              className="group block cursor-none rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0404]"
            >
              <div className="relative overflow-hidden rounded-[14px] bg-[#111] border border-white/[0.10] h-[380px] lg:h-[560px]">
                {p.foto_public_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.foto_public_url}
                    alt={p.name}
                    className="project-zoom absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.12] motion-reduce:transition-none motion-reduce:transform-none"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <div className="project-overlay absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                <div className="project-mobile-circle lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[148px] h-[148px] rounded-full bg-[#FF4D2E] flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <span className="text-[20px] font-black leading-none" aria-hidden>→</span>
                  <span className="text-[12px] font-black tracking-[0.08em] whitespace-nowrap">VIEW CASE STUDY</span>
                </div>
              </div>
              <div className="mt-5 lg:mt-6">
                <h2 className="text-[34px] sm:text-[40px] lg:text-[48px] font-bold tracking-[-0.04em] leading-[0.95] text-[#F0F3FF]">{p.name}</h2>
                {p.project_type ? (
                  <p className="mt-3 text-[16px] lg:text-[19px] leading-relaxed text-[#F0F3FF]/65">{p.project_type}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
        <div
          ref={cursorRef}
          aria-hidden
          className={`hidden lg:flex fixed left-0 top-0 z-[60] w-[224px] h-[224px] rounded-full bg-[#FF4D2E] flex-col items-center justify-center gap-1 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] will-change-transform pointer-events-none ${cursorActive ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          style={{ transform: "translate3d(-112px,-112px,0)", transition: "opacity 200ms, transform 0ms" }}
        >
          <span className="text-[38px] font-black leading-none">→</span>
          <span className="text-[13px] font-black tracking-[0.14em] whitespace-nowrap scale-x-[1.08]">VIEW CASE STUDY</span>
        </div>
      </div>
    </>
  );
}
