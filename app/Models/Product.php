<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'sku',
        'category_id',
        'in_stock',
        'unit_price',
        'reorder_level',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
