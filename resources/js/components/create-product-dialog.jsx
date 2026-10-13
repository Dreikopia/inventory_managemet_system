import { useForm } from "@inertiajs/react";
import { useEffect } from 'react'

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

const CreateProductDialog = ({ open, onOpenChange, categories }) => {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        sku: '',
        categoryId: '',
        inStock: '',
        unitPrice: '',
        reoderLevel: '',
    });

    //clean the form when the modal closes
    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open]);

    //Store() redirects back with a fresh form
    useEffect(() => {
        if (recentlySuccessful) {
            onOpenChange(false);
        }
    }, [recentlySuccessful])

    const submit = (e) => {
        e.preventDefault();
        post('/products');
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New product</DialogTitle>
                    <DialogDescription>Add a product to your inventory.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 grid gap-2">
                        <Label htmlFor="name">Product name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Air Condition"
                            aria-invalid={Boolean(errors.name)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="col-span-2 grid gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            value={data.sku}
                            onChange={(e) => setData('sku', e.target.value)}
                            placeholder="AIR-CON"
                            aria-invalid={Boolean(errors.sku)}
                        />
                        {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
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
                        {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="unit_price">Unit price</Label>
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
                        {errors.unit_price && <p className="text-sm text-destructive">{errors.unit_price}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="in_stock">In stock</Label>
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
                        {errors.in_stock && <p className="text-sm text-destructive">{errors.in_stock}</p>}
                    </div>

                    {/* REORDER LEVEL — half width */}
                    <div className="grid gap-2">
                        <Label htmlFor="reorder_level">Reorder level</Label>
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
                        {errors.reorder_level && <p className="text-sm text-destructive">{errors.reorder_level}</p>}
                    </div>

                    <DialogFooter className="col-span-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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