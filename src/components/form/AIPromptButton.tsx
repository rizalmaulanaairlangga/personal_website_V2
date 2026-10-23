"use client";

import { useState } from "react";
import { parseProjectJson } from "@/lib/project-json.mjs";
import type { ProjectMetadataImport } from "@/lib/types";

interface AIPromptButtonProps {
  onImport: (metadata: ProjectMetadataImport) => void;
}

export function AIPromptButton({ onImport }: AIPromptButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "copied" | "failed">("idle");
  const [fallback, setFallback] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const applyJson = () => {
    const result = parseProjectJson(jsonText);
    if (result.error) {
      setImportError(result.error);
      setImportSuccess(false);
      return;
    }
    if (!result.data) {
      setImportError("Could not read project metadata from the JSON response.");
      setImportSuccess(false);
      return;
    }

    onImport(result.data);
    setImportError(null);
    setImportSuccess(true);
  };

  const handleClick = async () => {
    setStatus("loading");
    setFallback(null);

    try {
      const res = await fetch("/api/ai-prompt", { method: "POST" });
      if (!res.ok) throw new Error("Failed to build prompt");
      const { prompt } = await res.json();

      try {
        await navigator.clipboard.writeText(prompt);
        setStatus("copied");
        window.setTimeout(() => setStatus("idle"), 2600);
      } catch {
        setFallback(prompt);
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
      setFallback("Could not build the prompt. Check that the CMS server is running.");
    }
  };

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text">AI project input</p>
          <p className="text-xs text-text-muted mt-0.5">
            Copy the prompt, give it your project details, then paste the JSON reply below. Applying it fills the form without saving.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={status === "loading"}
          className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap shrink-0"
        >
          {status === "loading" && (
            <span className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" aria-hidden="true" />
          )}
          {status === "copied" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === "idle" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {status === "loading"
            ? "Building..."
            : status === "copied"
              ? "Copied"
              : status === "failed"
                ? "Show prompt"
                : "Copy AI Project Prompt"}
        </button>
      </div>

      {status === "copied" && (
        <p className="mt-3 text-xs text-success" role="status">
          Prompt copied to your clipboard.
        </p>
      )}

      {status === "failed" && fallback && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-warning">
            Clipboard access was blocked. Copy the text below manually.
          </p>
          <textarea
            readOnly
            value={fallback}
            className="textarea font-mono text-[11px] min-h-[220px]"
            onFocus={(e) => e.currentTarget.select()}
            aria-label="AI prompt to copy manually"
          />
        </div>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <label htmlFor="ai-project-json" className="text-sm font-semibold text-text">
          Paste AI JSON response
        </label>
        <p className="mt-1 text-xs text-text-muted">
          Paste the JSON object from the prompt. Blank or omitted values keep current values, except an empty date clears the new-project default. Review before saving.
        </p>
        <textarea
          id="ai-project-json"
          aria-label="Paste AI JSON response"
          value={jsonText}
          onChange={(event) => {
            setJsonText(event.target.value);
            setImportError(null);
            setImportSuccess(false);
          }}
          className="textarea mt-2 min-h-[180px] font-mono text-xs"
          placeholder={'{\n  "name": "Project name",\n  "slug": "project-name"\n}'}
          spellCheck={false}
        />
        <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={applyJson}
            className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
          >
            Apply JSON to form
          </button>
          {importSuccess && (
            <p className="text-sm text-success" role="status">
              JSON applied. Review the fields before saving.
            </p>
          )}
          {importError && (
            <p className="text-sm text-danger" role="alert">
              {importError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
