import { useEffect } from 'react';
import { useForm } from "@inertiajs/react";
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from './ui/dialog';
import { Textarea } from './ui/textarea';


const SupplierDialog = ({ open, onOpenChange, supplier = null }) => {

    const isEdit = supplier !== null;

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            if (supplier) {
                setData({
                    name: supplier.name ?? '',
                    contact_person: supplier.contact_person ?? '',
                    phone: supplier.phone ?? '',
                    email: supplier.email ?? '',
                    address: supplier.address ?? '',
                });
            } else {
                reset();
            }
        }
    }, [open, supplier]);

    const handleSubmit = (e) => {

        e.preventDefault();

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        };

        if (isEdit) {
            patch(`/suppliers/${supplier.id}`, options);
        } else {
            post('/suppliers', options);
        };
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    {isEdit ? 'Edit Supplier' : 'Add Supplier'}
                </DialogHeader>
                <DialogDescription>
                    {isEdit
                        ? 'Update the supplier details below.'
                        : 'Fill in the details of the new supplier.'}
                </DialogDescription>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor="name"> Supplier name </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className='text-sm text-red-400'>{errors.name}</p>
                        )}
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='contact_person'> Contact Person</Label>
                        <Input
                            id='contact_person'
                            value={data.contact_person}
                            onChange={(e) => setData('contact_person', e.target.value)}
                        />
                        {errors.contact_person && (
                            <p className='text-sm text-red-400'>{errors.contact_person}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            rows={3}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEdit ? 'Save changes' : 'Add Supplier'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default SupplierDialog;