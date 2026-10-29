import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from 'cn';

// Single source of truth for movement-type pills. Keyed by the enum value
// (App\Enums\MovementType), which the model serializes as a plain string
// or as { value, label } if a label is ever appended server-side.
const STYLES = {
    stock_in: 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400',
    stock_out: 'border-transparent bg-red-500/15 text-red-700 dark:text-red-400',
    adjustment: 'border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400',
};

const LABELS = {
    stock_in: 'Stock in',
    stock_out: 'Stock out',
    adjustment: 'Adjustment',
};

const ICONS = {
    stock_in: ArrowDownToLine,
    stock_out: ArrowUpFromLine,
    adjustment: SlidersHorizontal,
};

const valueOf = (type) =>
    typeof type === 'string' ? type : (type?.value ?? null);

const MovementTypeBadge = ({ type, className }) => {
    const value = valueOf(type);
    const Icon = value ? ICONS[value] : null;

    if (!value || !STYLES[value]) {
        return null;
    }

    return (
        <Badge variant="outline" className={cn(STYLES[value], className)}>
            {Icon && <Icon className="size-3" aria-hidden="true" />}
            {LABELS[value]}
        </Badge>
    );
};

export default MovementTypeBadge;
