"use client";

import useReveal from "@/hooks/useReveal";

export default function Reveal({
  as: Tag = "div",
  variant = "fade",
  delay = 0,
  immediate = false,
  waitForImages = false,
  rot,
  className = "",
  style,
  children,
  ...props
}) {
  const { ref, revealed } = useReveal({ immediate, waitForImages });
  const revealStyle = {
    "--reveal-delay": `${delay}ms`,
    ...(rot ? { "--reveal-rotation": rot } : {}),
    ...style,
  };
  const clipVariant = variant === "clip";

  return (
    <Tag
      {...props}
      ref={ref}
      data-reveal={clipVariant ? "fade" : variant}
      className={`${className}${revealed ? " is-revealed" : ""}`}
      style={revealStyle}
      aria-hidden={!revealed}
      inert={!revealed}
    >
      {clipVariant ? (
        <div data-reveal="clip" className={revealed ? "is-revealed" : ""}>
          {children}
        </div>
      ) : children}
    </Tag>
  );
}
