"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RouteScrollReset() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const fromHistory = useRef(false);

  useEffect(() => {
    const markHistoryNavigation = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", markHistoryNavigation);
    return () => window.removeEventListener("popstate", markHistoryNavigation);
  }, []);

  useLayoutEffect(() => {
    const cameFrom = previousPath.current;
    const cameFromHistory = fromHistory.current;
    previousPath.current = pathname;
    fromHistory.current = false;
    // Same value means first mount or a StrictMode re-run, not a navigation.
    if (cameFrom === pathname) return;
    // Back/forward keeps the position the browser restored, and "/" restores its own saved position.
    if (cameFromHistory || pathname === "/") return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    // html{scroll-behavior:smooth} would animate the jump, and a glide still running would drag the page back.
    root.style.scrollBehavior = "auto";
    root.getClientRects(); // flush the computed override before the scroll
    try {
      if (window.lenis?.stop) window.lenis.stop();
    } catch {}
    window.scrollTo(0, 0);
    root.scrollTop = 0;
    requestAnimationFrame(() => {
      root.style.scrollBehavior = previousBehavior;
    });
  }, [pathname]);

  return null;
}
