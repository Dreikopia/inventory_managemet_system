import { Ellipsis, Eye, Pencil, SlidersHorizontal, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProductRowActions = ({ product, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${product.name}`}
        render={<Button variant="ghost" size="icon" />}
      >
        <Ellipsis />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* TODO: wire these three actions once their routes exist. */}
        <DropdownMenuItem>
          <Eye />
          View
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil />
          Edit
        </DropdownMenuItem>
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
