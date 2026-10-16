"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
export default function ScrollToTop() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        try {
          const lenis = window.lenis;
          if (lenis?.scrollTo) lenis.scrollTo(0, { immediate: true });
        } catch {}
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname]);
  return null;
}
