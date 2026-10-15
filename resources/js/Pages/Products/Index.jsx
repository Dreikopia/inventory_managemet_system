import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import CreateProductDialog from '@/components/create-product-dialog';
import { Button } from '@/components/ui/button';
import ProductRow from '@/components/product-row';


const Products = ({ products, categories }) => {

  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <div className='flex justify-end'>
        <Button onClick={() => setCreateOpen(true)} variant='secondary'>
          New Product
        </Button>
        <CreateProductDialog open={createOpen} onOpenChange={setCreateOpen} categories={categories} />
      </div>
      <div className="rounded-xl border border-sidebar-border bg-card">
              {products.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No products found.</p>
        ) : (
          <ul className="divide-y divide-sidebar-border">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

Products.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Products;
