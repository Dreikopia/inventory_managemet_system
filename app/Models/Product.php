<?php

namespace App\Models;

use App\Enums\StockStatus;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * Attributes that are computed rather than stored on the table.
     *
     * @var list<string>
     */
    protected $appends = ['stock_status', 'image_url'];

    protected $fillable = [
        'name',
        'image_path',
        'sku',
        'category_id',
        'supplier_id',
        'current_stock',
        'unit_price',
        'reorder_level',
    ];

    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->image_path
            ? Storage::disk('public')->url($this->image_path)
            : null);
    }

    protected function stockStatus(): Attribute
    {
        return Attribute::get(function (): array {

            $quantity = $this->inventory?->quantity ?? 0;

            $status = StockStatus::fromStockLevels($quantity, $this->reorder_level);

            return ['value' => $status->value, 'label' => $status->label()];
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class);
    }
}
