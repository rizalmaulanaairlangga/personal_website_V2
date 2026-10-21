"use client";

import { Tooltip } from "./Tooltip";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

/**
 * Label, optional requirement marker, and the "i" tooltip sit on one row so
 * the explanation is always adjacent to the input it describes.
 */
export function Field({ label, htmlFor, hint, required, tooltip, children }: FieldProps) {
  return (
    <div className="field-group">
      <div className="flex items-center gap-2">
        <label htmlFor={htmlFor} className="label mb-0">
          {label}
          {required && (
            <span className="text-danger ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <Tooltip label={label} content={tooltip} />
        {hint && <span className="text-[11px] text-text-dim">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
