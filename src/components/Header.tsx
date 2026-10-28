"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: { email?: string | null };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-text font-semibold tracking-tight">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="hidden sm:block">Portfolio CMS</span>
          </Link>

          <nav aria-label="Main navigation" className="ml-auto flex items-center gap-1">
            <Link href="/" className="btn-ghost px-3 py-2 text-sm">
              Projects
            </Link>
            <Link href="/tools" className="btn-ghost px-3 py-2 text-sm">
              Tools
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-text-dim">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="btn-ghost px-3 py-2 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
