"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BackLink({ href, children, className, goBack, clearScroll }) {
  const router = useRouter();

  const handleGoBack = (e) => {
    e.preventDefault();
    try { sessionStorage.setItem("skipIntro", "1"); } catch {}
    try {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(href || "/");
      }
    } catch {
      try { window.history.back(); } catch {}
    }
  };

  const handleNormalClick = () => {
    try { sessionStorage.setItem("skipIntro", "1"); } catch {}
    try {
      if (clearScroll) {
        sessionStorage.setItem("landing-scroll-y", "0");
        sessionStorage.removeItem("landing-restore");
      } else {
        sessionStorage.removeItem("landing-restore");
      }
    } catch {}
  };

  if (goBack) {
    return (
      <button type="button" onClick={handleGoBack} className={className} aria-label="Back">
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className} onClick={handleNormalClick}>
      {children}
    </Link>
  );
}
