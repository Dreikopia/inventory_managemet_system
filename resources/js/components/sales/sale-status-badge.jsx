import { Badge } from '@/components/ui/badge';
import { cn } from 'cn';

// Single source of truth for sale-status pills. Keyed by the enum value
// (App\Enums\SaleStatus), which the model serializes as a plain string.
const STYLES = {
    completed: 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400',
    voided: 'border-transparent bg-red-500/15 text-red-700 dark:text-red-400',
};

const LABELS = {
    completed: 'Completed',
    voided: 'Voided',
};

const SaleStatusBadge = ({ status, className }) => {
    const value = typeof status === 'string' ? status : (status?.value ?? null);

    if (!value || !STYLES[value]) {
        return null;
    }

    return (
        <Badge variant="outline" className={cn(STYLES[value], className)}>
            {LABELS[value]}
        </Badge>
    );
};

export default SaleStatusBadge;
