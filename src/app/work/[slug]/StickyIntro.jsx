"use client";
import { useEffect, useRef } from "react";

export default function StickyIntro({ introTitle, heroSubtitle, imageUrl }) {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    if (!section || !text) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const sh = section.offsetHeight;
        const y = -rect.top;
        const stickyTop = vh * 0.30;
        const pinDuration = vh * 0.60;
        const pinStart = stickyTop;
        const pinEnd = stickyTop + pinDuration;
        let off = 0;
        if (y < pinStart) off = 0;
        else if (y >= pinStart && y <= pinEnd) off = ((y - pinStart) / pinDuration) * (vh * 0.30);
        else if (y > pinEnd) off = vh * 0.30;
        text.style.transform = `translate3d(0,${off}px,0)`;
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
    <section ref={sectionRef} className="relative z-20 bg-[#0A0A0A] border-y border-white/[0.06]">
      <div className="relative h-[190vh]">
                <div
          className="absolute top-0 inset-x-0 h-[148px] lg:h-[188px] opacity-[0.13] pointer-events-none"
          style={{ backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 1px, transparent 1px 16px)` }}
          aria-hidden
        />
                <div ref={textRef} className="sticky top-[30vh] z-10 px-[3.2%] lg:px-[1%] py-6 pointer-events-none will-change-transform" style={{ transform: "translate3d(0,0,0)" }}>
          <div className="mx-auto max-w-[1840px] grid lg:grid-cols-[1.35fr_0.65fr] gap-8 items-start">
            <h2 className="text-left text-[26px] lg:text-[34px] font-light leading-[1.25] tracking-[-0.02em] text-white">
              {introTitle}
            </h2>
            <p className="text-left lg:text-right text-[14px] lg:text-[15px] font-mono tracking-[0.04em] leading-[1.6] text-white/65">
              {heroSubtitle}
            </p>
          </div>
        </div>
                <div className="absolute inset-x-0 bottom-0 h-[100vh] overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#1A1A1A]" />
          )}
          <div className="absolute inset-0 bg-black/15" />
        </div>
      </div>
    </section>
  );
}
