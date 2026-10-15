"use client";;
import { useIsPresent } from "motion/react";
import { useCallback, useState } from "react";
import { useTooltipPosition } from "./use-position";

/** Readiness lives with the mounted overlay, not a trigger ref's attach/detach cycle. */
export function TooltipPositioner({
  children,
  ...position
}) {
  const present = useIsPresent();
  const [ready, setReady] = useState(false);
  const [side, setSide] = useState(position.side);
  const onPosition = useCallback((placed) => {
    setReady(true);
    setSide(placed);
  }, []);
  useTooltipPosition({ ...position, open: present, onPosition });
  return (
    <span
      ref={position.floatingRef}
      inert={!present}
      aria-hidden={!present || undefined}
      className="pointer-events-none fixed left-0 top-0 z-[9999] w-max"
      style={{ visibility: "hidden", maxWidth: "calc(100vw - 16px)" }}
    >
      {children(ready, present, side)}
    </span>
  );
}

// Each arrow is a 12px box whose base sits on the surface's inner border edge,
// so its fill covers the border beneath it and only the two outer edges stroke.
const ARROW = {
  top: { path: "M0 6L6 12L12 6", style: { top: "calc(100% - 6px)" } },
  bottom: { path: "M0 6L6 0L12 6", style: { bottom: "calc(100% - 6px)" } },
  left: { path: "M6 0L12 6L6 12", style: { left: "calc(100% - 6px)" } },
  right: { path: "M6 0L0 6L6 12", style: { right: "calc(100% - 6px)" } },
};

export function TooltipArrow({
  side,
  ref
}) {
  const { path, style } = ARROW[side];
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className="pointer-events-none absolute overflow-visible"
      style={style}
    >
      <path d={`${path}Z`} style={{ fill: "var(--tooltip-arrow-fill, transparent)" }} />
      <path
        d={path}
        fill="none"
        strokeWidth="1"
        style={{ stroke: "var(--tooltip-arrow-stroke, transparent)" }}
      />
    </svg>
  );
}
