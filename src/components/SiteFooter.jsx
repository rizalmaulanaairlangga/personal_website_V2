// LOCKED PACKAGE: paired with Contact section — keep Contact + SiteFooter together
"use client";
import { useEffect, useRef } from "react";

export default function SiteFooter() {
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
        const fh = Math.min(vh * 0.42, 560);
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
