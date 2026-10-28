"use client";

import { FormEvent, useState } from "react";

interface CategorySelectProps {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const addCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const category = newCategory.trim();
    if (!category) return;

    const existing = categories.find((item) => item.toLowerCase() === category.toLowerCase());
    onChange(existing || category);
    setNewCategory("");
    setAddingCategory(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="input flex w-full items-center justify-between gap-3 text-left"
      >
        <span className={value ? "text-text" : "text-text-dim"}>
          {value || "Select a category"}
        </span>
        <svg className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border-strong bg-surface p-2 shadow-card">
          <div role="listbox" aria-label="Tool categories" className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                role="option"
                aria-selected={value === category}
                onClick={() => {
                  onChange(category);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  value === category
                    ? "bg-primary/15 text-primary"
                    : "text-text-muted hover:bg-white/[0.06] hover:text-text"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-2 border-t border-border pt-2">
            {addingCategory ? (
              <form onSubmit={addCategory} className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="New category"
                  aria-label="New category"
                  className="input min-w-0 flex-1 px-3 py-2 text-sm"
                  maxLength={80}
                />
                <button type="submit" className="btn-primary shrink-0 px-3 py-2 text-xs">
                  Add
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setAddingCategory(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
                </svg>
                Add category
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
