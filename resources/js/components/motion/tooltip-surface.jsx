"use client";;
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

/** Presentation only: the unanimated parent owns measurement and positioning. */
export function TooltipSurface({
  children,
  side: _side = "top",
  className,
  ref,
  ready = true,
  style,
  ...props
}) {
  const reduce = useReducedMotion();
  const closed = { opacity: 0, scale: reduce ? 1 : 0.94 };
  return (
    <motion.span
      ref={ref}
      role="tooltip"
      initial={closed}
      animate={{
        ...(ready ? { opacity: 1, scale: 1 } : closed),
        transition: { duration: 0.18, ease: EASE_OUT },
      }}
      exit={{ ...closed, transition: { duration: 0.12, ease: EASE_OUT } }}
      style={{ transformOrigin: "var(--tooltip-origin, center)", ...style }}
      className={cn(
        "block whitespace-nowrap rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </motion.span>
  );
}
