import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

const Field = ({ label, htmlFor, error, className = '', children }) => (
    <div className={`grid gap-1.5 ${className}`}>
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

const CreateProductDialog = ({ open, onOpenChange, categories }) => {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        sku: '',
        category_id: '',
        in_stock: '',
        unit_price: '',     // was "unitPrice": must match data.unit_price below
        reorder_level: '',  // was "reoderLevel": typo + must match data.reorder_level below
        image: null,
    });

    const [attachment, setAttachment] = useState(null);
    const [imageError, setImageError] = useState(null);

    // Clean the form (and the image preview) when the modal closes
    useEffect(() => {
        if (!open) {
            reset();
            setAttachment(null);
            setImageError(null);
        }
    }, [open]);

    // Close the dialog after a successful save
    useEffect(() => {
        if (recentlySuccessful) {
            onOpenChange(false);
        }
    }, [recentlySuccessful]);

    const submit = (e) => {
        e.preventDefault();
        post('/products', { forceFormData: true }); // forceFormData makes sure the image file is sent
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        
            <DialogContent className="flex max-h-[90vh] flex-col gap-4 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New product</DialogTitle>
                    <DialogDescription>Add a product to your inventory.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-4">
                    {/* Scrollable body: a 2-column grid, every field is 1 column unless told otherwise */}
                    <div className="-mx-1 grid min-h-0 flex-1 grid-cols-2 content-start gap-x-3 gap-y-3 overflow-y-auto px-1 py-1">
                        <Field label="Product name" htmlFor="name" error={errors.name}>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Air Conditioner"
                                aria-invalid={Boolean(errors.name)}
                            />
                        </Field>

                        <Field label="SKU" htmlFor="sku" error={errors.sku}>
                            <Input
                                id="sku"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                placeholder="AIR-CON"
                                aria-invalid={Boolean(errors.sku)}
                            />
                        </Field>

                        {/* col-span-2 = this field uses the full width */}
                        <Field
                            label="Product image"
                            htmlFor="product-image"
                            error={imageError ?? errors.image}
                            className="col-span-2"
                        >
                            <AttachmentUpload
                                id="product-image"
                                value={attachment ? [attachment] : []}
                                onValueChange={(items) => {
                                    const selectedAttachment = items[0] ?? null;

                                    setAttachment(selectedAttachment);
                                    setData('image', selectedAttachment?.file ?? null);
                                    setImageError(null);
                                }}
                                onFilesRejected={(files, reason) => {
                                    setImageError(
                                        reason === 'too-large'
                                            ? 'Image must be 10 MB or smaller.'
                                            : 'Please select a valid image.'
                                    );
                                }}
                                accept="image/jpeg,image/png,image/webp"
                                multiple={false}
                                maxFiles={1}
                                maxFileSize={10 * 1024 * 1024}
                                title="Drop an image or click to browse"
                                description="PNG, JPG or WebP, up to 10 MB"
                                classNames={{ dropzone: 'rounded-xl p-4' }}
                                disabled={processing}
                            />
                        </Field>

                        <Field label="Category" htmlFor="category" error={errors.category_id}>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) => setData('category_id', value === null ? '' : String(value))}
                                items={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                            >
                                <SelectTrigger id="category" className="w-full" aria-invalid={Boolean(errors.category_id)}>
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
                            />
                        </Field>

                        <Field label="Reorder level" htmlFor="reorder_level" error={errors.reorder_level}>
                            <Input
                                id="reorder_level"
                                type="number"
                                min="0"
                                step="1"
                                value={data.reorder_level}
                                onChange={(e) => setData('reorder_level', e.target.value)}
                                placeholder="15"
                                aria-invalid={Boolean(errors.reorder_level)}
                            />
                        </Field>
                    </div>

                    {/* Outside the scrolling div, so it is always visible */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating…' : 'Create product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProductDialog;