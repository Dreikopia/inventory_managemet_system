import { Image as ImageIcon } from 'lucide-react';
import ProductRowActions from '@/components/product-row-actions';
import { cn } from 'cn';

const currency = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const statusStyles = {
  active: 'bg-green-500/15 text-green-700 dark:text-green-400',
  low_stock: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  out_of_stock: 'bg-destructive/15 text-destructive',
};

const ProductThumbnail = ({ product }) =>
  product.image_url ? (
    <img
      src={product.image_url}
      alt={product.name}
      className="size-12 shrink-0 rounded-lg object-cover"
    />
  ) : (
    <div
      className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
      aria-hidden="true"
    >
      <ImageIcon className="size-5" />
    </div>
  );

const ProductRow = ({ product, className, onDelete }) => (
  <li className={cn('flex items-center gap-4 p-3', className)}>
    <ProductThumbnail product={product} />

    {/* Name + meta line */}
    <div className="min-w-0 flex-1">
      <p className="truncate font-medium">{product.name}</p>

      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>{product.sku}</span>
        <span aria-hidden="true">·</span>
        <span>{product.category?.name}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{product.in_stock} in stock</span>

        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-medium',
            statusStyles[product.stock_status.value] ?? statusStyles.active,
          )}
        >
          {product.stock_status.label}
        </span>
      </div>
    </div>

    {/* Price */}
    <div className="shrink-0 text-right">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Unit price
      </p>
      <p className="font-medium tabular-nums">
        {currency.format(product.unit_price)}
      </p>
    </div>

    <ProductRowActions product={product} onDelete={onDelete} />
  </li>
);

export default ProductRow;