import { Ellipsis, Pencil, SlidersHorizontal, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProductRowActions = ({ product, onEdit, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${product.name}`}
        render={<Button variant="ghost" size="icon" />}
      >
        <Ellipsis />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit?.(product)}>
          <Pencil />
          Edit
        </DropdownMenuItem>

        {/* TODO: stock adjustment route not built yet. */}
        <DropdownMenuItem>
          <SlidersHorizontal />
          Adjust stock
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* TODO: soft delete — API endpoint not built yet. */}
        <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(product)}>
          <Trash />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProductRowActions;
