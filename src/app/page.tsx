import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectsTable } from "@/components/ProjectsTable";
import { Header } from "@/components/Header";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Header user={session.user} />
      <main className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text">Projects</h1>
            <p className="mt-1 text-text-muted">Manage your portfolio projects</p>
          </div>
          <a href="/projects/new" className="btn-primary whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </a>
        </div>
        <ProjectsTable />
      </main>
    </div>
  );
}