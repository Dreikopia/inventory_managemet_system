import { Badge } from '@/components/ui/badge';
import { cn } from 'cn';

// Single source of truth for stock-status pills. Keyed by the enum value
// (App\Enums\StockStatus), which the Product model serializes as
// { value, label }. Labels are owned here so wording stays consistent.
const STYLES = {
    in_stock: 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400',
    low_stock: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400',
    out_of_stock: 'border-transparent bg-destructive/15 text-destructive',
};

const LABELS = {
    in_stock: 'In stock',
    low_stock: 'Low stock',
    out_of_stock: 'Out of stock',
};

const valueOf = (status) =>
    typeof status === 'string' ? status : (status?.value ?? null);

const StockStatusBadge = ({ status, className }) => {
    const value = valueOf(status);

    if (!value || !STYLES[value]) {
        return null;
    }

    return (
        <Badge variant="outline" className={cn(STYLES[value], className)}>
            {LABELS[value]}
        </Badge>
    );
};

export default StockStatusBadge;
