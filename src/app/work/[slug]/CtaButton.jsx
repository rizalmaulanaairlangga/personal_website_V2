"use client";

/* The white pill CTA used across the work pages, with either the arrow swap or
   the repository mark in the disc. The text wipe, hover colours, and arrow
   travel all come from the .detail-cta rules in globals.css, so both variants
   animate on the same timing. */

export const CTA_CLASS =
  "detail-cta btn-motion inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white text-[#0A0404] text-[16px] lg:text-[17px] font-semibold hover:bg-white/90 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)] min-h-[52px]";

export function ArrowDisc() {
  return (
    <span className="w-10 h-10 rounded-full bg-[#7AB8E8] text-white flex items-center justify-center text-[18px] leading-none shrink-0">
      <span aria-hidden="true" className="cta-arrow-viewport">
        <span className="cta-arrow-icon cta-arrow-icon-back">→</span>
        <span className="cta-arrow-icon cta-arrow-icon-front">→</span>
      </span>
    </span>
  );
}

/* The official GitHub mark, filled with currentColor so it inherits the disc. */
export function GitHubDisc() {
  return (
    <span className="w-10 h-10 rounded-full bg-[#7AB8E8] text-white flex items-center justify-center leading-none shrink-0">
      <span aria-hidden="true" className="repo-mark">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" focusable="false">
          <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.24-.02-2.25-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.21.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
        </svg>
      </span>
    </span>
  );
}

export default function CtaButton({ kind = "arrow", label, href, external = true, className = "" }) {
  const cls = CTA_CLASS + (className ? " " + className : "");
  const rel = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a href={href} className={cls} {...rel}>
      <span className="cta-label">{label}</span>
      {kind === "repo" ? <GitHubDisc /> : <ArrowDisc />}
    </a>
  );
}
