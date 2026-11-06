"use client";

import { useEffect, useRef, useState } from "react";

export default function useReveal({ immediate = false, waitForImages = false } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let observer;
    let frame = 0;
    let cancelImageWait = () => {};

    const reveal = () => {
      const pendingImages = waitForImages
        ? Array.from(element.querySelectorAll("img")).filter((image) => !image.complete)
        : [];
      if (pendingImages.length === 0) {
        setRevealed(true);
        return;
      }

      let remaining = pendingImages.length;
      const cleanups = [];
      const finishImage = () => {
        remaining -= 1;
        if (remaining === 0) {
          cleanups.forEach((cleanup) => cleanup());
          setRevealed(true);
        }
      };

      pendingImages.forEach((image) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          finishImage();
        };
        const cleanup = () => {
          image.removeEventListener("load", finish);
          image.removeEventListener("error", finish);
        };
        image.addEventListener("load", finish);
        image.addEventListener("error", finish);
        cleanups.push(cleanup);
        if (image.complete) finish();
      });

      cancelImageWait = () => cleanups.forEach((cleanup) => cleanup());
    };

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return undefined;
    }

    if (immediate) {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          frame = 0;
          reveal();
        });
      });
    } else if (typeof IntersectionObserver === "undefined") {
      reveal();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            const activeObserver = observer;
            observer = undefined;
            activeObserver.disconnect();
            reveal();
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
      );
      observer.observe(element);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      cancelImageWait();
    };
  }, [immediate, waitForImages]);

  return { ref, revealed };
}
