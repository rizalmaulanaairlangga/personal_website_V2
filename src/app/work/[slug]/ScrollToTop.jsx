"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export default function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    try {
      const lenis = window.lenis;
      if (lenis?.scrollTo) lenis.scrollTo(0, { immediate: true });
    } catch {}
  }, [pathname]);
  return null;
}
