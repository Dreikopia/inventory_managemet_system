<?php

namespace App\Models;

use App\Enums\StockStatus;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'image_path',
        'sku',
        'category_id',
        'in_stock',
        'unit_price',
        'reorder_level',
    ];

    protected function stockStatus(): Attribute
    {
        return Attribute::get(function (): array {
            $status = StockStatus::fromStockLevels($this->in_stock, $this->reorder_level);

            return ['value' => $status->value, 'label' => $status->label()];
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
