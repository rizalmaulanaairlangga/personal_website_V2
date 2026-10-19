"use client";
import { useEffect, useRef } from "react";

export default function GalleryReveal({ projectId }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const section = rootRef.current?.closest("[data-gallery-section]");
    if (!section) return undefined;

    const row = section.querySelector("[data-device-row]");
    const desktop = section.querySelector("[data-desktop-showcase]");
    const reveal = () => {
      row?.classList.add("is-visible");
      desktop?.classList.add("is-visible");
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      reveal();
      return undefined;
    }

    // Check if already visible in viewport
    const isInViewport = () => {
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    if (isInViewport()) {
      reveal();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [projectId]);

  return <span ref={rootRef} aria-hidden="true" style={{ display: "none" }} />;
}
