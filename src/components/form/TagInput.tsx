"use client";

import { useState } from "react";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

const COMMON_STACK = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Nuxt",
  "Svelte", "Tailwind CSS", "Bootstrap", "Node.js", "Express", "Django", "Laravel",
  "Flutter", "Dart", "React Native", "Expo", "Supabase", "PostgreSQL", "MongoDB",
  "Firebase", "Prisma", "Python", "Go", "Three.js", "GSAP", "Framer Motion", "Vite",
  "Figma", "Blender",
];

export function TagInput({ value, onChange, placeholder, suggestions = COMMON_STACK }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  const available = suggestions.filter((s) => !value.includes(s));

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary pl-3 pr-1.5 py-1.5 text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
                className="w-5 h-5 rounded-full hover:bg-primary/25 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={placeholder || "Type a technology and press Enter"}
        className="input"
        aria-label="Add technology"
      />

      {available.length > 0 && (
        <div>
          <p className="text-[11px] text-text-dim mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-1.5">
            {available.slice(0, 14).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="rounded-md bg-white/[0.05] border border-border px-2.5 py-1 text-xs text-text-muted hover:text-text hover:border-border-strong hover:bg-white/[0.08] transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
