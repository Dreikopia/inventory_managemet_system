<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/Index', [
            'inventories' => Inventory::with([
                'product.category',
                'movements' => fn ($query) => $query->with('user')->latest()->take(5),
            ])->latest()->get(),
        ]);
    }
}
