"use client";
import { useEffect, useRef } from "react";

export default function GalleryReveal() {
  const rootRef = useRef(null);

  useEffect(() => {
    const section = rootRef.current?.closest("[data-gallery-section]");
    if (!section) return undefined;

    const row = section.querySelector("[data-device-row]");
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

    return () => {
      images.forEach((image) => image.removeEventListener("error", handleImageError));
    };
  }, []);

  return <span ref={rootRef} aria-hidden="true" style={{ display: "none" }} />;
}
