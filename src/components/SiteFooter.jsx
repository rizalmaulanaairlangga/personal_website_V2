"use client";
import { useEffect, useRef } from "react";

const CONTACT_EMAIL = "rizalmaulanaairlangga456@gmail.com";

const CONTACTS = [
  {
    label: "Email Address",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    label: "LinkedIn",
    value: "in/rizal-maulana-airlangga-072b21346",
    href: "https://www.linkedin.com/in/rizal-maulana-airlangga-072b21346/",
    external: true,
  },
  {
    label: "GitHub",
    value: "github.com/rizalmaulanaairlangga",
    href: "https://github.com/rizalmaulanaairlangga",
    external: true,
  },
];

/* Two stacked copies of one line; the track lifts by exactly one line on
   hover or keyboard focus, so the visible text never changes. */
function TickerValue({ value }) {
  return (
    <span className="footer-ticker">
      <span className="footer-ticker-track">
        <span className="footer-ticker-line">{value}</span>
        <span className="footer-ticker-line" aria-hidden="true">
          {value}
        </span>
      </span>
    </span>
  );
}

export default function SiteFooter({ spacerId }) {
  const innerRef = useRef(null);
  const footerRef = useRef(null);
  const spacerRef = useRef(null);

  useEffect(() => {
    const inner = innerRef.current;
    const footer = footerRef.current;
    const spacer = spacerRef.current;
    if (!inner || !footer) return;
    let raf = 0;
    let fh = footer.offsetHeight;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const docH = document.documentElement.scrollHeight;
        const vh = window.innerHeight;
        const start = docH - vh - fh;
        const end = docH - vh;
        const y = window.scrollY;
        const progress = Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start)));
        const off = (1 - progress) * 92;
        inner.style.transform = `translate3d(0,${off}px,0)`;
        inner.style.willChange = progress < 0.99 ? "transform" : "auto";
      });
    };

    /* The footer is one viewport tall and grows with its content, so the flow
       spacer that carries the reveal height has to track the real height. */
    const syncHeight = () => {
      fh = footer.offsetHeight;
      if (spacer) {
        const px = `${fh}px`;
        if (spacer.style.height !== px) spacer.style.height = px;
      }
      onScroll();
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(footer);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncHeight);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        id={spacerId}
        ref={spacerRef}
        className="footer-spacer pointer-events-none"
        aria-hidden
      />
      <footer
        ref={footerRef}
        className="footer-surface fixed bottom-0 inset-x-0 z-0 overflow-hidden"
      >
        <div ref={innerRef} className="footer-inner" style={{ transform: "translate3d(0,92px,0)" }}>
          <div className="footer-main">
            <p className="footer-eyebrow">OPEN TO OPPORTUNITIES</p>
            <h2 className="footer-headline">
              Have an idea? Let&apos;s{" "}
              <br />
              <span className="footer-headline-em">explore</span>
              {" "}it.
            </h2>
            <p className="footer-support">
              I&apos;m a developer in the making, always curious about what&apos;s possible with technology. I&apos;m open to interesting projects, new challenges, and opportunities to collaborate.
            </p>
            <a href="/contact" className="hero-cta hero-cta-secondary footer-cta btn-motion mt-[clamp(4px,1.2vh,14px)]">
              <span className="cta-label">Get in touch</span>
              <span className="footer-cta-arrow">
                <span aria-hidden="true" className="cta-arrow-viewport">
                  <span className="cta-arrow-icon cta-arrow-icon-back">→</span>
                  <span className="cta-arrow-icon cta-arrow-icon-front">→</span>
                </span>
              </span>
            </a>
          </div>

          <div className="footer-contact">
            {CONTACTS.map((contact) => (
              <div key={contact.label} className="footer-col">
                <p className="footer-col-label">{contact.label}</p>
                <a
                  href={contact.href}
                  className="footer-link"
                  {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <TickerValue value={contact.value} />
                </a>
              </div>
            ))}
          </div>

          <div className="footer-rule" aria-hidden />
          <p className="footer-name select-none">Rizal Maulana Airlangga</p>
        </div>
      </footer>
    </>
  );
}
