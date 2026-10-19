"use client";
import { useEffect, useRef } from "react";

const CONTACT_EMAIL = "rizalmaulanaairlangga456@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/rizal-maulana-airlangga-072b21346/";
const GITHUB_URL = "https://github.com/rizalmaulanaairlangga";

const columnLabel = "text-[9px] lg:text-[12px] font-mono font-semibold tracking-[0.18em] uppercase text-[#0A0404]/70";
const columnValue =
  "block mt-1 lg:mt-1.5 text-[10.5px] sm:text-[13px] lg:text-[15px] font-medium leading-[1.3] lg:leading-[1.35] text-[#0A0404] [overflow-wrap:anywhere] decoration-[#0A0404] decoration-2 underline-offset-4 hover:underline focus-visible:underline outline-none";

export default function SiteFooter({ spacerId }) {
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
      <div id={spacerId} className="h-[42vh] min-h-[280px] pointer-events-none" aria-hidden />
      <footer
        className="fixed bottom-0 inset-x-0 z-0 overflow-hidden flex flex-col h-[42vh] min-h-[280px] border-t border-[#0A0404]/20"
        style={{
          backgroundColor: "#7AB8E8",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E")`,
        }}
      >
        <div
          ref={innerRef}
          className="flex-1 relative flex flex-col justify-between gap-2 lg:gap-4 px-[3.2%] md:px-[1.6%] lg:px-[1%] pt-3 lg:pt-4 will-change-transform"
          style={{ transform: "translate3d(0,92px,0)" }}
        >
          <div className="grid gap-2.5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="min-w-0">
              <p className="text-[11px] lg:text-[13px] font-mono font-semibold tracking-[0.2em] uppercase text-[#0A0404]/70">
                Get in touch
              </p>
              <h2 className="mt-1 lg:mt-1.5 text-[19px] sm:text-[24px] lg:text-[30px] xl:text-[34px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0A0404]">
                Have an idea? Let&apos;s explore it.
              </h2>
              <p className="mt-1.5 lg:mt-2 text-[11px] sm:text-[13px] lg:text-[14px] leading-[1.4] lg:leading-[1.45] text-[#0A0404]/80 max-w-[58ch] lg:max-w-[72ch]">
                I&apos;m a developer in the making, always curious about what&apos;s possible with technology.
                I&apos;m open to interesting projects, new challenges, and opportunities to collaborate.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <a
                href="/contact"
                className="footer-cta btn-motion inline-flex items-center gap-2.5 lg:gap-3 pl-5 lg:pl-6 pr-2 py-1.5 lg:py-2 rounded-full bg-[#0A0404] text-white text-[13px] lg:text-[16px] font-semibold min-h-[40px] lg:min-h-[50px] transition-colors hover:bg-black"
              >
                <span className="cta-label">Get in touch</span>
                <span className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#7AB8E8] text-white flex items-center justify-center shrink-0">
                  <span aria-hidden="true" className="cta-arrow-viewport">
                    <span className="cta-arrow-icon cta-arrow-icon-back">→</span>
                    <span className="cta-arrow-icon cta-arrow-icon-front">→</span>
                  </span>
                </span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-2.5 lg:gap-x-10 border-t border-[#0A0404]/25 pt-2 lg:pt-3">
            <div className="min-w-0">
              <p className={columnLabel}>Email Address</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className={columnValue}>
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="min-w-0">
              <p className={columnLabel}>LinkedIn</p>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={columnValue}>
                <span className="hidden lg:inline">linkedin.com/in/</span>rizal-maulana-airlangga-072b21346
              </a>
            </div>
            <div className="min-w-0">
              <p className={columnLabel}>GitHub</p>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={columnValue}>
                <span className="hidden lg:inline">github.com/</span>rizalmaulanaairlangga
              </a>
            </div>
          </div>

          <div>
            <div className="footer-rule" aria-hidden />
            <p className="footer-name select-none pointer-events-none" aria-hidden="true">
              Rizal Maulana Airlangga
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
