"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";

interface ProjectsTableProps {}

export function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      search: debouncedSearch,
      limit: pageSize.toString(),
      offset: (page * pageSize).toString(),
    });

    fetch(`/api/projects?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      })
      .then((data) => {
        setProjects(data.projects || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedSearch, page]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      alert("Failed to delete project");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && projects.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-48">
          <div className="loading-skeleton w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <svg className="w-12 h-12 mx-auto text-danger mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-text">Failed to load projects</p>
        <p className="text-sm text-text-muted mt-1">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="card empty-state">
        <svg className="w-16 h-16 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-text">No projects found</p>
        <p className="text-sm text-text-muted">Get started by creating your first project</p>
        <Link href="/projects/new" className="btn-primary mt-4">
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4"
            aria-label="Search projects"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="table" role="grid">
          <thead>
            <tr>
              <th scope="col" className="w-16">Preview</th>
              <th scope="col">Project</th>
              <th scope="col" className="hidden md:table-cell">Type</th>
              <th scope="col" className="hidden lg:table-cell">Date</th>
              <th scope="col" className="hidden xl:table-cell">Stack</th>
              <th scope="col" className="w-40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>
                  {project.foto_public_url ? (
                    <img
                      src={project.foto_public_url}
                      alt=""
                      className="w-12 h-8 rounded-lg object-cover border border-border"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-8 rounded-lg bg-white/[0.03] border border-border flex items-center justify-center">
                      <svg className="w-5 h-5 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </td>
                <td>
                  <div>
                    <Link href={`/projects/${project.id}`} className="font-semibold text-text hover:text-primary transition-colors">
                      {project.name}
                    </Link>
                    <p className="text-xs font-mono text-text-dim mt-0.5">{project.slug || "—"}</p>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                  <span className="badge">{project.project_type || "—"}</span>
                </td>
                <td className="hidden lg:table-cell text-text-muted">{formatDate(project.date)}</td>
                <td className="hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(project.frameworks || []).slice(0, 3).map((fw) => (
                      <span key={fw} className="badge-primary">{fw}</span>
                    ))}
                    {((project.frameworks || []).length) > 3 && (
                      <span className="badge">+{(project.frameworks!.length - 3)}</span>
                    )}
                  </div>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/projects/${project.id}`} className="btn-ghost px-3 py-2 text-sm" aria-label="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      className="btn-ghost px-3 py-2 text-sm text-danger hover:text-danger hover:bg-danger/10"
                      aria-label="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <p className="text-sm text-text-muted">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total} projects
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="btn-secondary px-3 py-2 text-sm"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * pageSize >= total}
              className="btn-secondary px-3 py-2 text-sm"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}