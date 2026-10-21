"use client";

import { Credit } from "@/lib/types";

interface CreditsEditorProps {
  value: Credit[];
  onChange: (value: Credit[]) => void;
}

export function CreditsEditor({ value, onChange }: CreditsEditorProps) {
  const update = (index: number, patch: Partial<Credit>) => {
    const next = value.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange(next);
  };

  const add = () => onChange([...value, { name: "", role: "" }]);

  const remove = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [{ name: "", role: "" }]);
  };

  return (
    <div className="space-y-3">
      {value.map((credit, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={credit.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Full name"
              aria-label={`Member ${index + 1} name`}
              className="input"
            />
            <input
              type="text"
              value={credit.role}
              onChange={(e) => update(index, { role: e.target.value })}
              placeholder="Role, e.g. Frontend"
              aria-label={`Member ${index + 1} role`}
              className="input"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={`Remove member ${index + 1}`}
            className="btn-ghost px-3 py-3 text-danger hover:bg-danger/10 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}

      <button type="button" onClick={add} className="btn-secondary px-4 py-2 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add member
      </button>
    </div>
  );
}
