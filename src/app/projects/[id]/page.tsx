import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { ProjectFormClient } from "./ProjectFormClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  if (id === "new") {
    return <ProjectFormClient mode="create" initialData={null} />;
  }

  const supabase = createServiceClient();
  const { data: project, error } = await supabase
    .from("proyek_web")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  // Fetch screenshots
  const { data: screenshots } = await supabase
    .from("project_screenshots")
    .select("*")
    .eq("project_id", id)
    .order("sort_order");

  return <ProjectFormClient mode="edit" initialData={{ project, screenshots: screenshots || [] }} />;
}