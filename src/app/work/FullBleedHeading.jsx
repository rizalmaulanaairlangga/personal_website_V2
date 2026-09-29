"use client";
import { useEffect, useRef } from "react";

export default function FullBleedHeading({ text, tag = "p", className = "", label }) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el) return;
    let raf = 0;
    let cancelled = false;
    const fit = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (cancelled) return;
        const target = wrap.clientWidth;
        if (!target) return;
        el.style.fontSize = "100px";
        const w = el.scrollWidth;
        if (!w) return;
        el.style.fontSize = `${(100 * target) / w}px`;
      });
    };
    fit();
    window.addEventListener("resize", fit);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => { if (!cancelled) fit(); }).catch(() => {});
    }
    return () => {
      cancelled = true;
      window.removeEventListener("resize", fit);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text]);

  const Tag = tag;
  return (
    <div ref={wrapRef} className="w-full overflow-hidden">
      <Tag
        ref={textRef}
        aria-label={label || text}
        style={{ fontSize: "13vw" }}
        className={`block w-max whitespace-nowrap select-none lowercase font-black leading-[1] pb-[0.2em] -mb-[0.2em] ${className}`}
      >
        {text}
      </Tag>
    </div>
  );
}
