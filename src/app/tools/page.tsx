import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { ToolsManager } from "@/components/tools/ToolsManager";
import { getUser } from "@/lib/auth";

export default async function ToolsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="btn-ghost -ml-2 mb-4 inline-flex px-2 py-1.5 text-sm">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Projects
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-text">Tools</h1>
          <p className="mt-1 text-text-muted">Manage the tools shown on the public portfolio.</p>
        </div>
        <ToolsManager />
      </main>
    </div>
  );
}
