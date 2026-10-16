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

export const ProductThumbnail = ({ product, className }) =>
  product.image_url ? (
    <img
      src={product.image_url}
      alt=""
      className={cn('size-12 shrink-0 rounded-lg object-cover', className)}
    />
  ) : (
    <div
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground',
        className,
      )}
      aria-hidden="true"
    >
      <ImageIcon className="size-5" />
    </div>
  );

const ProductRow = ({ product, className, onEdit, onDelete }) => (
  <li
    className={cn(
      'flex items-center gap-4 p-3 transition-colors',
      onEdit && 'cursor-pointer hover:bg-muted/60',
      className,
    )}
    onClick={onEdit ? () => onEdit(product) : undefined}
  >
    <ProductThumbnail product={product} />

    {/* Name + meta line — the button gives keyboard users a way in, and its
        click bubbles to the row handler. */}
    <div className="min-w-0 flex-1">
      <button
        type="button"
        className="block w-full max-w-full truncate rounded-sm text-left font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {product.name}
      </button>

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
      <p className="font-medium tabular-nums">{currency.format(product.unit_price)}</p>
    </div>

    {/* Stops menu clicks — including portaled items — from opening the drawer. */}
    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
      <ProductRowActions product={product} onEdit={onEdit} onDelete={onDelete} />
    </div>
  </li>
);

export default ProductRow;
