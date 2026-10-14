import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import CreateProductDialog from '@/components/create-product-dialog';
import ProductRowActions from '@/components/product-row-actions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusStyles = {
  active: 'bg-green-500/15 text-green-700 dark:text-green-400',
  low_stock: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  out_of_stock: 'bg-destructive/15 text-destructive',
};

const statusLabels = {
  active: 'Active',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
};

const Products = ({ products, categories }) => {

  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <div className='flex justify-end'>
        <Button onClick={() => setCreateOpen(true)}>
          Create Product
        </Button>
        <CreateProductDialog open={createOpen} onOpenChange={setCreateOpen} categories={categories} />
      </div>
      <div className="rounded-xl border border-sidebar-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="text-right tabular-nums">{product.stock}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[product.status] ?? statusStyles.active}`}
                    >
                      {statusLabels[product.status] ?? product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

Products.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Products;
