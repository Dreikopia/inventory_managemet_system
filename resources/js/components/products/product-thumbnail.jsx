import { Image as ImageIcon } from 'lucide-react';
import { cn } from 'cn';

const ProductThumbnail = ({ product, className }) =>
    product?.image_url ? (
        <img
            src={product.image_url}
            alt=""
            loading="lazy"
            decoding="async"
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

export default ProductThumbnail;
