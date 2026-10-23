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
    const isInViewport = () => {
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };
    const revealIfVisible = () => {
      if (isInViewport()) reveal();
    };
    const handleImageError = (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;

      const device = image.closest("[data-device]");
      const desktopShowcase = image.closest("[data-desktop-showcase]");
      if (device) device.hidden = true;
      if (desktopShowcase) desktopShowcase.hidden = true;

      if (row && !row.querySelector("[data-device]:not([hidden])")) {
        row.hidden = true;
      }
    };
    const images = section.querySelectorAll("[data-screenshot-image]");
    images.forEach((image) => {
      image.addEventListener("error", handleImageError);
      if (image.complete && image.naturalWidth === 0) handleImageError({ target: image });
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer;
    if (reduce || typeof IntersectionObserver === "undefined") {
      reveal();
    } else if (isInViewport()) {
      reveal();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            reveal();
            observer?.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
      );
      observer.observe(section);
    }

    window.addEventListener("pageshow", revealIfVisible);
    return () => {
      observer?.disconnect();
      window.removeEventListener("pageshow", revealIfVisible);
      images.forEach((image) => image.removeEventListener("error", handleImageError));
    };
  }, [projectId]);

  return <span ref={rootRef} aria-hidden="true" style={{ display: "none" }} />;
}
