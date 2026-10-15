<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Render the products page with a sample product listing.
     *
     * @return array<int, array{ id: int, name: stroing, sku: string, stock: int, status: string }>
     */
    public function index()
    {
        return Inertia::render('Products/Index', [
            'products' => Product::with('category')->get(),
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('images/products', 'public');
        }
        Product::create($validated);

        return redirect()
            ->route('products')
            ->with('success', 'Product created successfully.');
    }
}
