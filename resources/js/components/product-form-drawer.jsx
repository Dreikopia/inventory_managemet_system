import { useForm } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useState } from 'react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AttachmentUpload } from './motion/attachment-upload';
import { ProductThumbnail } from './product-row';

const Field = ({ label, htmlFor, error, className = '', children }) => (
    <div className={`grid gap-1.5 ${className}`}>
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

const emptyForm = () => ({
    name: '',
    sku: '',
    category_id: '',
    in_stock: '',
    unit_price: '',
    reorder_level: '',
    image: null,
    remove_image: false,
});

const formFor = (product) => ({
    name: product.name ?? '',
    sku: product.sku ?? '',
    category_id: product.category_id ? String(product.category_id) : '',
    in_stock: product.in_stock ?? '',
    unit_price: product.unit_price ?? '',
    reorder_level: product.reorder_level ?? '',
    image: null,
    remove_image: false,
});

const ProductFormDrawer = ({ open, onOpenChange, product, categories }) => {
    const isEdit = Boolean(product);

    const { data, setData, post, put, processing, errors, recentlySuccessful } =
        useForm(emptyForm());

    const [attachment, setAttachment] = useState(null);
    const [imageError, setImageError] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false);

    useLayoutEffect(() => {
        setData(product ? formFor(product) : emptyForm());
        setAttachment(null);
        setImageError(null);
        setImageRemoved(false);
    }, [open, product]);

    useEffect(() => {
        if (recentlySuccessful) {
            onOpenChange(false);
        }
    }, [recentlySuccessful]);

    const selectImage = (items) => {
        const selected = items[0] ?? null;

        setAttachment(selected);
        setData('image', selected?.file ?? null);
        setImageError(null);

        // Picking a file supersedes an earlier request to drop the saved image.
        if (selected) {
            setImageRemoved(false);
            setData('remove_image', false);
        }
    };

    const removeSavedImage = () => {
        setImageRemoved(true);
        setData('remove_image', true);
    };

    const undoRemoveSavedImage = () => {
        setImageRemoved(false);
        setData('remove_image', false);
    };

    const submit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/products/${product.id}`, { forceFormData: true });
        } else {
            post('/products', { forceFormData: true });
        }
    };

    const showSavedImage = isEdit && product.image_url && !imageRemoved && !attachment;
    const showRemovalNote = isEdit && product.image_url && imageRemoved && !attachment;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="gap-0 data-[side=right]:w-[85vw] data-[side=right]:sm:w-[400px] data-[side=right]:md:w-[500px] data-[side=right]:lg:w-[600px] data-[side=right]:sm:max-w-none"
            >
                <SheetHeader className="shrink-0 border-b">
                    <div className="pr-10">
                        <SheetTitle>{isEdit ? 'Edit product' : 'New product'}</SheetTitle>
                        <SheetDescription className="mt-1">
                            {isEdit
                                ? 'Update this product’s details.'
                                : 'Add a product to your inventory.'}
                        </SheetDescription>
                    </div>

                    {isEdit && (
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-sidebar-border bg-muted/40 p-2.5">
                            <ProductThumbnail product={product} />

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{product.name}</p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {product.sku}
                                    {product.category?.name ? ` · ${product.category.name}` : ''}
                                </p>
                            </div>
                        </div>
                    )}
                </SheetHeader>

                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        <div className="grid gap-3">
                            <Field label="Product name" htmlFor="name" error={errors.name}>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Air Conditioner"
                                    aria-invalid={Boolean(errors.name)}
                                    disabled={processing}
                                />
                            </Field>

                            <Field label="SKU" htmlFor="sku" error={errors.sku}>
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    placeholder="AIR-CON"
                                    aria-invalid={Boolean(errors.sku)}
                                    disabled={processing}
                                />
                            </Field>

                            <Field
                                label="Product image"
                                htmlFor="product-image"
                                error={imageError ?? errors.image}
                            >
                                {showSavedImage && (
                                    <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-muted/40 p-2">
                                        <img
                                            src={product.image_url}
                                            alt=""
                                            className="size-11 shrink-0 rounded-lg object-cover"
                                        />
                                        <p className="min-w-0 flex-1 truncate text-sm">
                                            Current image
                                        </p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeSavedImage}
                                            disabled={processing}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}

                                {showRemovalNote && (
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-3 py-2">
                                        <p className="text-xs text-destructive">
                                            The image is removed when you save.
                                        </p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="xs"
                                            onClick={undoRemoveSavedImage}
                                            disabled={processing}
                                        >
                                            Undo
                                        </Button>
                                    </div>
                                )}

                                <AttachmentUpload
                                    id="product-image"
                                    value={attachment ? [attachment] : []}
                                    onValueChange={selectImage}
                                    onFilesRejected={(files, reason) => {
                                        setImageError(
                                            reason === 'too-large'
                                                ? 'Image must be 10 MB or smaller.'
                                                : 'Please select a valid image.',
                                        );
                                    }}
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple={false}
                                    maxFiles={1}
                                    maxFileSize={10 * 1024 * 1024}
                                    title={
                                        showSavedImage
                                            ? 'Drop a new image or click to browse'
                                            : 'Drop an image or click to browse'
                                    }
                                    description="PNG, JPG or WebP, up to 10 MB"
                                    classNames={{ dropzone: 'min-h-32 rounded-xl p-4' }}
                                    disabled={processing}
                                />
                            </Field>

                            <Field label="Category" htmlFor="category" error={errors.category_id}>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(value) =>
                                        setData('category_id', value === null ? '' : String(value))
                                    }
                                    items={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                                >
                                    <SelectTrigger
                                        id="category"
                                        className="w-full"
                                        aria-invalid={Boolean(errors.category_id)}
                                    >
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Unit price" htmlFor="unit_price" error={errors.unit_price}>
                                    <Input
                                        id="unit_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.unit_price}
                                        onChange={(e) => setData('unit_price', e.target.value)}
                                        placeholder="89.99"
                                        aria-invalid={Boolean(errors.unit_price)}
                                        disabled={processing}
                                    />
                                </Field>

                                <Field label="In stock" htmlFor="in_stock" error={errors.in_stock}>
                                    <Input
                                        id="in_stock"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.in_stock}
                                        onChange={(e) => setData('in_stock', e.target.value)}
                                        placeholder="128"
                                        aria-invalid={Boolean(errors.in_stock)}
                                        disabled={processing}
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Reorder level"
                                htmlFor="reorder_level"
                                error={errors.reorder_level}
                            >
                                <Input
                                    id="reorder_level"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.reorder_level}
                                    onChange={(e) => setData('reorder_level', e.target.value)}
                                    placeholder="15"
                                    aria-invalid={Boolean(errors.reorder_level)}
                                    disabled={processing}
                                />
                            </Field>
                        </div>
                    </div>

                    <SheetFooter className="shrink-0 border-t sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit
                                ? processing
                                    ? 'Saving…'
                                    : 'Save changes'
                                : processing
                                    ? 'Creating…'
                                    : 'Create product'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default ProductFormDrawer;
