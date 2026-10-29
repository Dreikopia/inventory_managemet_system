<?php

namespace App\Models;

use App\Enums\SaleStatus;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'sales_number',
        'user_id',
        'total_amount',
        'status',
        'remarks',
        'voided_at',
    ];

    protected $casts = [
        'status' => SaleStatus::class,
        'voided_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class);
    }
}
