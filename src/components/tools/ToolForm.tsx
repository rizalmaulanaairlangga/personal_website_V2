"use client";

import { FormEvent, useEffect, useState } from "react";
import { CategorySelect } from "./CategorySelect";

interface ToolFormProps {
  categories: string[];
  onCreated: () => void | Promise<void>;
  onCancel: () => void;
}

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export function ToolForm({ categories, onCreated, onCancel }: ToolFormProps) {
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !shortDescription.trim() || !category.trim() || !file) {
      setError("Complete each field and choose a tool logo.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("short_desc", shortDescription.trim());
      formData.set("category", category.trim());
      formData.set("file", file);

      const response = await fetch("/api/tools", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not add tool.");
      }

      await onCreated();
    } catch (err) {
      setError((err as Error).message || "Could not add tool.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-5 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">Add a tool</h2>
          <p className="mt-2 text-sm text-text-muted">Add a name, description, category, and logo to the portfolio catalog.</p>
        </div>
        <button type="button" onClick={onCancel} disabled={saving} className="btn-ghost px-2 py-1 text-sm">
          Cancel
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-text">
          Tool name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input"
            placeholder="e.g. Astro"
            maxLength={120}
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-text">
          Category
          <CategorySelect categories={categories} value={category} onChange={setCategory} />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-text">
        Short description
        <textarea
          value={shortDescription}
          onChange={(event) => setShortDescription(event.target.value)}
          className="textarea min-h-[88px]"
          placeholder="What do you use this tool for?"
          maxLength={240}
          required
        />
      </label>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-text">Tool logo</span>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-black/30">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Selected tool logo preview" className="h-full w-full object-contain p-2" />
            ) : (
              <svg className="h-8 w-8 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.5-4.5a2 2 0 012.828 0L16 16m-2-2 1.5-1.5a2 2 0 012.828 0L20 14m-12-5h.01M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
              </svg>
            )}
          </div>
          <div className="space-y-2">
            <label className="btn-secondary cursor-pointer px-4 py-2 text-sm">
              {file ? "Choose another image" : "Choose image"}
              <input
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  event.target.value = "";
                }}
              />
            </label>
            <p className="text-xs text-text-dim">PNG, JPEG, WebP, or GIF. Maximum 10 MB; compressed before storage.</p>
            {file && <p className="max-w-full truncate text-xs text-text-muted">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      <div className="flex justify-end border-t border-border pt-4">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" aria-hidden="true" />}
          {saving ? "Adding tool..." : "Add tool"}
        </button>
      </div>
    </form>
  );
}
