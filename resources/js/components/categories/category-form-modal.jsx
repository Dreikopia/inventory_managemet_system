import { useForm } from "@inertiajs/react";
import { useEffect, useLayoutEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/Components/ui/dialog";

const CategoryFormModal = ({ open, onOpenChange, category }) => {
    const isEdit = Boolean(category)

    const { data, setData, post, patch, processing, errors, recentlySuccessful } = useForm({
        name: ''
    })

    useLayoutEffect(() => {
        setData({ name: category?.name ?? '' });
    }, [open, category]);

    useEffect(() => {
        if (recentlySuccessful) {
            onOpenChange(false);
        }
    }, [recentlySuccessful])

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(`/categories/${category.id}`);
        } else {
            post('/categories');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
                        <DialogDescription>
                            {isEdit
                                ? 'Give this category a new name.'
                                : 'Group related products under one category.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-1.5">
                        <Label htmlFor="category-name">Category name</Label>
                        <Input
                            id="category-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="HEPA Filters"
                            aria-invalid={Boolean(errors.name)}
                            disabled={processing}
                            autoFocus
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button type="button" variant="outline" disabled={processing}>
                                    Cancel
                                </Button>
                            }
                        />
                        <Button type="submit" disabled={processing}>
                            {isEdit
                                ? processing
                                    ? 'Saving…'
                                    : 'Save changes'
                                : processing
                                    ? 'Creating…'
                                    : 'Create category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CategoryFormModal;