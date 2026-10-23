"use client";

import { useState } from "react";

export default function MobileHeroDevice({ src, alt }) {
  const [unavailable, setUnavailable] = useState(false);

  return (
    <div className="relative flex min-h-[620px] items-center justify-center overflow-hidden rounded-[16px] border border-white/[0.10] bg-[#111010] py-10 lg:min-h-[780px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(122,184,232,0.16),transparent_55%)]" />
      {unavailable ? (
        <p className="relative max-w-[28ch] px-6 text-center text-sm text-[#F0F3FF]/65" role="status">
          The mobile hero screenshot could not be loaded.
        </p>
      ) : (
        <div className="relative h-[min(72vh,700px)] max-h-[700px] min-h-[480px] aspect-[9/19.5] rounded-[34px] border-[3px] border-[#7AB8E8]/50 bg-black p-2 shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
          <span aria-hidden className="absolute left-1/2 top-3 z-10 h-1.5 w-[28%] -translate-x-1/2 rounded-full bg-white/35" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onError={() => setUnavailable(true)}
            className="h-full w-full rounded-[27px] bg-black object-contain"
          />
        </div>
      )}
    </div>
  );
}
