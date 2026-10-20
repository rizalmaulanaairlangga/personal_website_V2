"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const GALLERY = [
  {
    href: "/work/absensi-muda-mudi-gemurung-2",
    src: "/images/projects/absensi-muda-mudi-gemurung-2/desktop-absensi-muda-mudi-gemurung-2.png",
    sizes: "(min-width: 1024px) 62vw, 100vw",
    name: "Absensi Muda-Mudi Gemurung 2",
    type: "Attendance Web App",
    ratio: "aspect-[16/9]",
    span: "sm:col-span-2",
    offset: "",
    badge: "Latest Project",
    label: "Desktop dashboard of the attendance web app",
  },
  {
    href: "/work/assetrack-3d-landing-page",
    src: "/images/projects/assetrack-3d-landing-page/phone-assetrack-3d-landing-page.jpeg",
    sizes: "(min-width: 1024px) 31vw, 100vw",
    name: "AssetTrack 3D Landing Page",
    type: "3D Landing Page",
    ratio: "aspect-[3/4]",
    span: "",
    offset: "sm:mt-12 lg:mt-16",
    label: "Mobile view of the 3D landing page",
  },
];

export default function ContactGallery() {
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
    const syncCircle = () => {
      circle.style.transform = `translate3d(${cx - 112}px, ${cy - 112}px, 0)`;
    };
    const cardUnderPointer = () => {
      if (!hasPointer) return null;
      let el = null;
      try { el = document.elementFromPoint(lastX, lastY); } catch { el = null; }
      const card = el?.closest?.("[data-project-link]");
      return card && container.contains(card) ? card : null;
    };
    const tick = () => {
      raf = 0;
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      circle.style.transform = `translate3d(${cx - 112}px, ${cy - 112}px, 0)`;
      if (active && (Math.abs(mx - cx) > 0.4 || Math.abs(my - cy) > 0.4)) {
        raf = requestAnimationFrame(tick);
      }
    };
    const setActive = (inside) => {
      if (inside !== active) {
        active = inside;
        setCursorActive(inside);
      }
    };
    const checkScroll = () => {
      if (!hasPointer) return;
      const card = cardUnderPointer();
      setActive(!!card);
      if (card && !raf) raf = requestAnimationFrame(tick);
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
      const first = !hasPointer;
      mx = e.clientX;
      my = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      hasPointer = true;
      if (first) {
        cx = mx;
        cy = my;
        syncCircle();
      }
      const card = cardUnderPointer();
      setActive(!!card);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onEnter = (e) => {
      if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
        const first = !hasPointer;
        mx = e.clientX;
        my = e.clientY;
        lastX = e.clientX;
        lastY = e.clientY;
        hasPointer = true;
        if (first) {
          cx = mx;
          cy = my;
          syncCircle();
        }
        const card = cardUnderPointer();
        setActive(!!card);
        if (card && !raf) raf = requestAnimationFrame(tick);
        return;
      }
      if (!hasPointer) return;
      checkScroll();
    };
    const onLeave = () => {
      active = false;
      setCursorActive(false);
    };
    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onScroll);
      ro.observe(container);
    }
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative cursor-none">
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 items-start">
        {GALLERY.map((item) => (
          <a
            key={item.href}
            href={item.href}
            data-project-link={item.href}
            className={`group relative block cursor-none overflow-hidden rounded-[20px] lg:rounded-[24px] border border-white/[0.08] bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7AB8E8] ${item.span} ${item.offset}`}
          >
            <div className={`relative w-full overflow-hidden ${item.ratio}`}>
              <Image
                fill
                sizes={item.sizes}
                src={item.src}
                alt={`${item.name} — ${item.label}`}
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
                {item.badge && (
                  <span className="mb-2 inline-flex items-center rounded-full border border-[#7AB8E8]/45 bg-[#7AB8E8]/15 px-3 py-1 text-[10px] lg:text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#7AB8E8]">
                    {item.badge}
                  </span>
                )}
                <p className="text-[17px] lg:text-[22px] font-semibold tracking-[-0.01em] text-white">{item.name}</p>
                <p className="mt-1 text-[11px] lg:text-[12px] font-mono uppercase tracking-[0.16em] text-white/70">{item.type}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div
        ref={cursorRef}
        aria-hidden
        className={`hidden lg:flex fixed left-0 top-0 z-[60] w-[224px] h-[224px] rounded-full bg-[#7AB8E8] flex-col items-center justify-center gap-1 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] will-change-transform pointer-events-none ${cursorActive ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        style={{ transform: "translate3d(-112px,-112px,0)", transition: "opacity 200ms, transform 0ms" }}
      >
        <span className="arrow-mark w-[44px] h-[44px]">→</span>
        <span className="text-[14px] font-black tracking-[0.14em] whitespace-nowrap scale-x-[1.08]">VIEW CASE STUDY</span>
      </div>
    </div>
  );
}
