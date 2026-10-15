<?php

namespace App\Enums;

enum StockStatus: string
{
    case IN_STOCK = 'in_stock';
    case LOW_STOCK = 'low_stock';
    case OUT_OF_STOCK = 'out_of_stock';

    public static function fromStockLevels(int $inStock, int $reorderLevel): self
    {
        return match (true) {
            $inStock === 0 => self::OUT_OF_STOCK,
            $inStock <= $reorderLevel => self::LOW_STOCK,
            default => self::IN_STOCK,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::IN_STOCK => 'In stock',
            self::LOW_STOCK => 'Low',
            self::OUT_OF_STOCK => 'Out of stock',
        };
    }
}
