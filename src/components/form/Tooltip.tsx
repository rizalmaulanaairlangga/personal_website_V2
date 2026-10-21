"use client";

import { useCallback, useId, useRef, useState, useSyncExternalStore } from "react";

/**
 * Only one tooltip may be open at a time. The panels are wide enough to
 * overlap a neighbouring trigger, and a second panel opening underneath the
 * pointer would leave the first one stranded.
 */
let activeTooltipId: string | null = null;
const listeners = new Set<() => void>();

function setActiveTooltip(id: string | null) {
  if (activeTooltipId === id) return;
  activeTooltipId = id;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return activeTooltipId;
}

interface TooltipProps {
  label: string;
  content: string;
}

/**
 * A small "i" affordance that reveals the field's meaning on hover, keyboard
 * focus, or click. The panel sits above the trigger and closes when the
 * pointer or focus leaves it.
 */
export function Tooltip({ label, content }: TooltipProps) {
  const id = useId();
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const openId = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const open = openId === id;

  const show = useCallback(() => {
    setActiveTooltip(id);
  }, [id]);

  const hide = useCallback(() => {
    if (activeTooltipId === id) setActiveTooltip(null);
  }, [id]);

  const toggle = () => {
    if (pinned && open) {
      setPinned(false);
      hide();
    } else {
      setPinned(true);
      show();
    }
  };

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex items-center justify-center"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`About ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={toggle}
        onFocus={show}
        onBlur={(e) => {
          if (!wrapperRef.current?.contains(e.relatedTarget as Node)) hide();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setPinned(false);
            hide();
          }
        }}
        className="tooltip-trigger"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4M12 8h.01" />
        </svg>
      </button>

      {open && (
        <span id={id} role="tooltip" className="tooltip-content group">
          {content}
          <button
            type="button"
            onClick={() => {
              setPinned(false);
              hide();
              triggerRef.current?.focus();
            }}
            className="mt-2 block text-[11px] text-primary hover:underline"
          >
            Close
          </button>
        </span>
      )}
    </span>
  );
}
