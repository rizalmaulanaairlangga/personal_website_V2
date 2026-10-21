"use client";

import { useEffect, useRef, useState } from "react";
import { SCREENSHOT_ROLES, ScreenshotRoleKey } from "@/lib/types";

interface ScreenshotManagerProps {
  files: Record<ScreenshotRoleKey, File | null>;
  previews: Record<ScreenshotRoleKey, string | null>;
  existingUrls: Record<ScreenshotRoleKey, string | null>;
  onFileSelect: (role: ScreenshotRoleKey, file: File | null) => void;
  onRemove: (role: ScreenshotRoleKey) => void;
  disabled?: boolean;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024;

export function ScreenshotManager({
  files,
  previews,
  existingUrls,
  onFileSelect,
  onRemove,
  disabled,
}: ScreenshotManagerProps) {
  const [dragRole, setDragRole] = useState<ScreenshotRoleKey | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ScreenshotRoleKey, string>>>({});
  const [dims, setDims] = useState<Partial<Record<ScreenshotRoleKey, { w: number; h: number }>>>({});
  const inputRefs = useRef<Partial<Record<ScreenshotRoleKey, HTMLInputElement | null>>>({});

  useEffect(() => {
    const next: Partial<Record<ScreenshotRoleKey, { w: number; h: number }>> = {};
    let pending = Object.keys(previews).length;

    (Object.keys(previews) as ScreenshotRoleKey[]).forEach((role) => {
      const src = previews[role];
      if (!src) {
        pending -= 1;
        if (pending === 0) setDims({});
        return;
      }
      const img = new Image();
      img.onload = () => {
        next[role] = { w: img.naturalWidth, h: img.naturalHeight };
        pending -= 1;
        if (pending === 0) setDims(next);
      };
      img.onerror = () => {
        pending -= 1;
        if (pending === 0) setDims(next);
      };
      img.src = src;
    });
  }, [previews]);

  const validate = (role: ScreenshotRoleKey, file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) {
      return "Unsupported format. Use PNG, JPEG, WebP, or GIF.";
    }
    if (file.size > MAX_BYTES) {
      return "File exceeds the 10 MB limit.";
    }
    return null;
  };

  const accept = (role: ScreenshotRoleKey, file: File | undefined) => {
    if (!file) return;
    const problem = validate(role, file);
    if (problem) {
      setErrors((e) => ({ ...e, [role]: problem }));
      return;
    }
    setErrors((e) => ({ ...e, [role]: undefined }));
    onFileSelect(role, file);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {SCREENSHOT_ROLES.map((role) => {
        const preview = previews[role.key];
        const existing = existingUrls[role.key];
        const file = files[role.key];
        const size = dims[role.key];

        return (
          <div
            key={role.key}
            className="rounded-xl border border-border bg-white/[0.02] p-4 space-y-3"
            onDragOver={(e) => {
              e.preventDefault();
              setDragRole(role.key);
            }}
            onDragLeave={() => setDragRole((r) => (r === role.key ? null : r))}
            onDrop={(e) => {
              e.preventDefault();
              setDragRole(null);
              accept(role.key, e.dataTransfer.files?.[0]);
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text">{role.label}</p>
                <p className="text-xs text-text-dim mt-0.5">
                  {role.key === "hero" ? "Required for the hero image" : "Optional"}
                </p>
              </div>
              <span className="badge shrink-0">{role.key === "hero" ? "Hero" : "Gallery"}</span>
            </div>

            <div
              className={`relative aspect-[16/10] rounded-lg overflow-hidden border-2 border-dashed transition-colors ${
                dragRole === role.key
                  ? "border-primary bg-primary/10"
                  : "border-border bg-black/30"
              }`}
            >
              {preview || existing ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview || existing || ""}
                    alt={`${role.label} preview`}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  {preview && (
                    <span className="absolute top-2 left-2 badge-success">New upload</span>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-dim">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6.1 3.5 3.5 0 0118.5 16H7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12v6m0-6l-2.5 2.5M12 12l2.5 2.5" />
                  </svg>
                  <span className="text-xs">Drag an image or browse</span>
                </div>
              )}
            </div>

            {file && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-text-dim">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
            )}

            {size && (
              <p className="text-xs text-text-dim">
                {size.w} × {size.h} px · ratio {(size.w / size.h).toFixed(2)}:1
              </p>
            )}

            {errors[role.key] && (
              <p className="text-xs text-danger" role="alert">{errors[role.key]}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRefs.current[role.key]?.click()}
                disabled={disabled}
                className="btn-secondary px-3 py-2 text-xs flex-1"
              >
                {preview || existing ? "Replace" : "Select file"}
              </button>
              {(preview || existing) && (
                <button
                  type="button"
                  onClick={() => onRemove(role.key)}
                  disabled={disabled}
                  className="btn-ghost px-3 py-2 text-xs text-danger hover:bg-danger/10"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              ref={(el) => { inputRefs.current[role.key] = el; }}
              type="file"
              accept={ACCEPTED.join(",")}
              className="sr-only"
              onChange={(e) => {
                accept(role.key, e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
