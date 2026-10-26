import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogClose, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductImageLightbox({
    open,
    onOpenChange,
    src,
    alt = "Product image",
    className = "",
}) {
    const closeRef = useRef(null);

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

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="bg-black/45 backdrop-blur-xl" />
            <DialogContent
                className={cn(
                    "p-0 max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] sm:max-h-[90vh]",
                    className
                )}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl block mx-auto"
                />

                <DialogClose asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute -right-3 -top-3 grid size-9 place-items-center rounded-full bg-background text-foreground shadow-xl ring-1 ring-border/70 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Close image preview"
                    >
                        <X className="size-4" />
                        <span className="sr-only">Close image preview</span>
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}