"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductImageLightbox({
  open,
  onOpenChange,
  src,
  alt = "Product image",
  className = "",
}) {
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (typeof document === "undefined") return null;

  const content = open ? (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center cursor-zoom-out",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.08 : 0.12 }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
      />
      <img
        src={src}
        alt={alt}
        className="relative max-h-[75vh] max-w-[75vw] object-contain select-none rounded-lg shadow-2xl"
        draggable={false}
        onClick={() => onOpenChange(false)}
      />
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        aria-label="Close image preview"
        className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm outline-none transition-colors hover:bg-black/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <X className="size-5" />
      </button>
    </motion.div>
  ) : null;

  return createPortal(
    <AnimatePresence mode="wait">{content}</AnimatePresence>,
    document.body
  );
}
