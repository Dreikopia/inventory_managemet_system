
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import CategoryFormModal from '@/components/category-form-modal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CategoryRowActions from '@/components/category-row-actions';

const Categories = ({ categories }) => {

    const [modal, setModal] = useState({ open: false, category: null });

    const openCreate = () => setModal({ open: true, category: null });
    const openEdit = (category) => setModal({ open: true, category });
    const [deleting, setDeleting] = useState(null);

    return (

        <div className='space-y-6'>
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className="text-2xl font-bold">
                        Categories
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your product categories.
                    </p>

                </div>

                <div>
                    <Button onClick={openCreate} variant="secondary">
                        New category
                    </Button>

                    <CategoryFormModal
                        open={modal.open}
                        onOpenChange={(open) => setModal((current) => ({ ...current, open }))}
                        category={modal.category}
                    />

                </div>
            </div>

            <div className='rounded-lg border bg-muted'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead className='text-right'>
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {categories.length === 0 ?
                            (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground" >
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )
                            : (
                                categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            {category.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge>
                                                {category.products_count} products
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className='flex justify-end'>
                                                <CategoryRowActions
                                                    category={category}
                                                    onEdit={openEdit}
                                                    onDelete={setDeleting}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        }

                    </TableBody>
                </Table>

            </div>

        </div >
    );
}

Categories.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Categories;
