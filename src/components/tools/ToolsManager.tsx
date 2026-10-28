"use client";

import { useCallback, useEffect, useState } from "react";
import { PortfolioTool } from "@/lib/types";
import { ToolForm } from "./ToolForm";

export function ToolsManager() {
  const [tools, setTools] = useState<PortfolioTool[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadTools = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/tools", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load tools.");
      setTools(result.tools || []);
      setCategories(result.categories || []);
    } catch (err) {
      setError((err as Error).message || "Could not load tools.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTools();
  }, [loadTools]);

  const handleCreated = async () => {
    setShowForm(false);
    setNotice("Tool added to the portfolio catalog.");
    await loadTools();
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="btn-ghost px-2 py-1 text-xs text-success">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger" role="alert">
          {error}
          <button type="button" onClick={() => void loadTools()} className="ml-3 underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {showForm && (
        <ToolForm
          categories={categories}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <section className="card space-y-5 p-4 sm:p-6" aria-labelledby="tools-list-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="tools-list-title" className="text-lg font-semibold text-text">Tools catalog</h2>
            <p className="mt-1 text-sm text-text-muted">
              {loading ? "Loading tools..." : `${tools.length} tools · ${categories.length} categories`}
            </p>
          </div>
          {!showForm && (
            <button type="button" onClick={() => { setNotice(null); setShowForm(true); }} className="btn-primary shrink-0">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add tool
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-36 items-center justify-center" role="status" aria-label="Loading tools">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : tools.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-medium text-text">No tools found</p>
            <p className="mt-1 text-sm text-text-muted">Add the first tool to the public portfolio catalog.</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <li key={tool.tool_id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black/30 p-1.5">
                  {tool.logo_public_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tool.logo_public_url} alt={`${tool.name} logo`} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-text-dim" aria-hidden="true">{tool.name.slice(0, 2)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-text">{tool.name}</h3>
                    <span className="badge shrink-0">{tool.category || "Uncategorized"}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-dim">{tool.short_desc}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
