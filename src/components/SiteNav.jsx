"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { id: "home", label: "Home", href: "#" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "about", label: "About", href: "#about" },
  { id: "tools", label: "Tools", href: "#tools" },
  { id: "services", label: "Services", href: "#services" },
  { id: "process", label: "Work Process", href: "#process" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(isHome ? "home" : null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!isHome) return;
    const ids = ["projects", "about", "tools", "services", "process", "contact"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    const onScroll = () => {
      if (window.scrollY < 200) setActiveSection("home");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  const goTo = (e, item) => {
    e.preventDefault();
    setMenuOpen(false);
    setActiveSection(item.id);
    if (isHome) {
      setTimeout(() => {
        const lenis = typeof window !== "undefined" ? window.lenis : null;
        if (item.id === "home") {
          if (lenis?.scrollTo) lenis.scrollTo(0, { duration: 1.4 });
          else window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const el = document.getElementById(item.id);
        if (!el) return;
        if (lenis?.scrollTo) lenis.scrollTo(el, { duration: 1.4 });
        else el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 90);
    } else {
      try {
        sessionStorage.setItem("skipIntro", "1");
        sessionStorage.setItem("landing-scroll-y", "0");
        sessionStorage.removeItem("landing-restore");
      } catch {}
      router.push(item.id === "home" ? "/" : "/#" + item.id);
    }
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#0a0404]/60 backdrop-blur-[12px] isolate [transform:translateZ(0)] [backface-visibility:hidden]">
        <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] h-[76px] md:h-[92px] flex items-center justify-between">
          <a
            href={isHome ? "#" : "/"}
            onClick={(e) => goTo(e, menuItems[0])}
            className="flex items-center group min-h-[48px] min-w-[48px]"
            aria-label="Home"
          >
            <span className="relative w-[48px] h-[48px] md:w-[52px] md:h-[52px] rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-visible p-[8px]">
              <Image
                src="/images/logo-r.webp"
                alt="R logo"
                width={30}
                height={30}
                className="object-contain w-[28px] h-[28px] md:w-[30px] md:h-[30px] shrink-0"
                priority
              />
            </span>
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="group relative w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-full border border-white/10 bg-white/[0.04] flex flex-col items-center justify-center gap-[5px] overflow-hidden hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span
              aria-hidden
              className={`absolute inset-0 rounded-full bg-white/[0.12] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${menuOpen ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"}`}
            />
            <span
              className={`relative z-10 block w-[25px] md:w-[29px] h-[1.5px] bg-white transition-all duration-300 ease-out motion-reduce:transition-none ${menuOpen ? "rotate-45 translate-y-[3.5px]" : "group-hover:w-[19px] md:group-hover:w-[22px] group-hover:translate-x-[3px] md:group-hover:translate-x-[3.5px]"}`}
            />
            <span
              className={`relative z-10 block w-[25px] md:w-[29px] h-[2px] bg-white transition-all duration-300 ease-out motion-reduce:transition-none ${menuOpen ? "-rotate-45 -translate-y-[3.25px]" : "group-hover:w-[19px] md:group-hover:w-[22px] group-hover:-translate-x-[3px] md:group-hover:-translate-x-[3.5px]"}`}
            />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-full sm:w-[420px] lg:w-[480px] bg-[#0B0B0C] border-l border-white/10 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-label="Site menu"
        >
          <div className="h-[76px] md:h-[92px] shrink-0 flex items-center justify-between px-6 lg:px-8 border-b border-white/10">
            <p className="flex items-center gap-2.5 text-[14px] font-mono font-medium tracking-[0.14em] text-white/85">
              <span className="w-2 h-2 bg-[#FF4D2E]" aria-hidden />
              MENU
            </p>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              tabIndex={menuOpen ? 0 : -1}
              className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white text-[18px] leading-none hover:bg-white hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <span aria-hidden>✕</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 lg:px-8 py-2">
            {menuItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={isHome ? item.href : item.id === "home" ? "/" : "/#" + item.id}
                  onClick={(e) => goTo(e, item)}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? "true" : undefined}
                  className="group flex items-center gap-3 py-3 lg:py-4 border-b border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm"
                >
                  <span className="relative inline-block text-[34px] sm:text-[40px] lg:text-[44px] font-black uppercase leading-[0.9] tracking-[-0.02em] text-[#EDEDED] group-hover:text-white transition-colors">
                    {item.label}
                    <span aria-hidden className="absolute -bottom-1.5 lg:-bottom-2 left-0 h-[3px] lg:h-[4px] w-full bg-[#FF4D2E] scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left motion-reduce:transition-none" />
                  </span>
                  {active && (
                    <span aria-hidden className="w-[10px] h-[10px] bg-[#FF4D2E] shrink-0" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="shrink-0 px-6 lg:px-8 pt-4 pb-6">
            <p className="text-[14px] font-mono tracking-[0.12em] text-white/40">(SOCIALS)</p>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
              <a href="https://www.instagram.com/a_rizal_i/" target="_blank" rel="noopener noreferrer" tabIndex={menuOpen ? 0 : -1} className="group relative inline-flex w-fit items-center gap-1.5 text-[20px] lg:text-[22px] font-medium tracking-[-0.01em] text-white/85 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm">
                Instagram <span aria-hidden className="text-[15px] text-white/50 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all">↗</span>
                <span aria-hidden className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#FF4D2E] scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left motion-reduce:transition-none" />
              </a>
              <a href="https://www.linkedin.com/in/rizal-maulana-airlangga-072b21346/" target="_blank" rel="noopener noreferrer" tabIndex={menuOpen ? 0 : -1} className="group relative inline-flex w-fit items-center gap-1.5 text-[20px] lg:text-[22px] font-medium tracking-[-0.01em] text-white/85 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm">
                LinkedIn <span aria-hidden className="text-[15px] text-white/50 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all">↗</span>
                <span aria-hidden className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#FF4D2E] scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left motion-reduce:transition-none" />
              </a>
              <a href="mailto:rizalmaulanaairlangga456@gmail.com" tabIndex={menuOpen ? 0 : -1} className="group relative inline-flex w-fit items-center gap-1.5 text-[20px] lg:text-[22px] font-medium tracking-[-0.01em] text-white/85 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm">
                Email <span aria-hidden className="text-[15px] text-white/50 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all">↗</span>
                <span aria-hidden className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#FF4D2E] scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left motion-reduce:transition-none" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
