import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ProductFormDrawer from '@/components/product-form-drawer';
import { Button } from '@/components/ui/button';
import ProductRow from '@/components/product-row';

const Index = ({ products, categories }) => {
  const [drawer, setDrawer] = useState({ open: false, product: null });

  const openCreate = () => setDrawer({ open: true, product: null });
  const openEdit = (product) => setDrawer({ open: true, product });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length === 0
              ? 'Nothing here yet.'
              : `${products.length} in the catalog.`}
          </p>
        </div>

        <Button onClick={openCreate} variant="secondary">
          New product
        </Button>
      </div>

      <div className="rounded-xl border border-sidebar-border bg-card">
        {products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No products yet.</p>
            <Button className="mt-4" variant="outline" onClick={openCreate}>
              Add your first product
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-sidebar-border">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} onEdit={openEdit} />
            ))}
          </ul>
        )}
      </div>

      <ProductFormDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer((current) => ({ ...current, open }))}
        product={drawer.product}
        categories={categories}
      />
    </>
  );
};

Index.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Index;
