import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPT = "image/jpeg,image/png,image/webp";

export function ProductImageUpload({
    value,
    onValueChange,
    src,
    onRemove,
    onView,
    disabled = false,
    className = "",
}) {
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);

    const inputRef = useRef(null);
    const urlRef = useRef(null);

    useEffect(() => {
        return () => {
            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
            }
        };
    }, []);

    const handleFiles = useCallback(
        (files) => {
            const file = Array.from(files ?? [])[0];

            if (!file) return;

            if (!ACCEPT.split(",").includes(file.type)) {
                setError("Please select a valid image (JPG, PNG, or WebP).");
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                setError("Image must be 2 MB or smaller.");
                return;
            }

            setError(null);

            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
            }

            const objectUrl = URL.createObjectURL(file);

            urlRef.current = objectUrl;
            setPreview(objectUrl);

            onValueChange(file);
        },
        [onValueChange]
    );

    const handleChange = (e) => {
        handleFiles(e.currentTarget.files);

        e.currentTarget.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();

        if (disabled) return;

        handleFiles(e.dataTransfer.files);
    };

    const handleRemove = () => {
        if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
        }

        setPreview(null);
        setError(null);

        onValueChange(null);
        onRemove?.();
    };

    const hasImage = Boolean(preview || src);

    return (
        <div className={cn("space-y-3", className)}>
            <div
                onDragEnter={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={cn(
                    "relative isolate flex min-h-0 flex-1 flex-row items-center justify-between overflow-hidden rounded-xl border-2 border-dashed p-3 outline-none transition-colors duration-200",
                    disabled
                        ? "border-border/50 bg-muted/40 pointer-events-none opacity-60"
                        : "border-border hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    hasImage
                        ? "border-transparent bg-muted"
                        : "bg-background"
                )}
            >
                {!hasImage && !disabled ? (
                    <>
                        <MotionUploadIcon className="shrink-0" />

                        <div className="min-w-0 flex-1 text-left pl-2">
                            <p className="text-sm font-semibold text-foreground">
                                Drop an image or click to browse
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                PNG, JPG or WebP, up to 2 MB
                            </p>
                        </div>

                        <input
                            ref={inputRef}
                            id="product-image"
                            type="file"
                            accept={ACCEPT}
                            disabled={disabled}
                            className="sr-only"
                            onChange={handleChange}
                        />

                        <label
                            htmlFor="product-image"
                            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Upload className="size-4" />
                            Choose file
                        </label>
                    </>
                ) : (
                    <>
                        {hasImage && (
                            <img
                                src={preview || src}
                                alt="Product preview"
                                className="size-14 shrink-0 rounded-lg object-cover"
                            />
                        )}

                        <div className="flex items-center gap-2 shrink-0">
                            <input
                                ref={inputRef}
                                id="product-image"
                                type="file"
                                accept={ACCEPT}
                                disabled={disabled}
                                className="sr-only"
                                onChange={handleChange}
                            />

                            {onView && hasImage && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onView(preview || src)}
                                    disabled={disabled}
                                >
                                    View image
                                </Button>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => inputRef.current?.click()}
                                disabled={disabled}
                            >
                                Change
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                disabled={disabled}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    );
}

function MotionUploadIcon({ className = "" }) {
    return (
        <div className={cn("grid size-9 place-items-center rounded-2xl bg-muted text-foreground shrink-0", className)}>
            <Upload className="size-[18px]" />
        </div>
    );
}
