<?php

use App\Models\Product;
use Database\Seeders\CategorySeeder;
use Database\Seeders\ProductSeeder;
use Illuminate\Support\Facades\Storage;

it('seeds products with images copied onto the public disk', function () {
    Storage::fake('public');

    $this->seed(CategorySeeder::class);
    $this->seed(ProductSeeder::class);

    $products = Product::query()->whereNotNull('image_path')->get();

    expect($products)->toHaveCount(10);

    foreach ($products as $product) {
        expect($product->image_path)
            ->toStartWith('images/products/')
            ->toContain(strtolower($product->sku));

        Storage::disk('public')->assertExists($product->image_path);
    }
});

it('seeds twenty products split evenly between air conditioners and other categories', function () {
    Storage::fake('public');

    $this->seed(CategorySeeder::class);
    $this->seed(ProductSeeder::class);

    expect(Product::query()->count())->toBe(20)
        ->and(Product::query()->whereNull('image_path')->count())->toBe(10);

    $nonAirConditionerProducts = Product::query()
        ->whereNull('image_path')
        ->whereRelation('category', 'name', '!=', 'Air Conditioners')
        ->get();

    expect($nonAirConditionerProducts)->toHaveCount(10)
        ->and($nonAirConditionerProducts->pluck('category.name')->unique()->sort()->values()->all())->toBe([
            'Air Filters',
            'Air Purifiers',
            'Ductwork',
            'HEPA Filters',
            'HVAC Parts',
            'Thermostats',
        ]);
});

it('assigns image products to the Air Conditioners category', function () {
    Storage::fake('public');

    $this->seed(CategorySeeder::class);
    $this->seed(ProductSeeder::class);

    $category = Product::query()
        ->whereNotNull('image_path')
        ->first()
        ->category;

    expect($category->name)->toBe('Air Conditioners');
});

it('is idempotent across repeat seed runs', function () {
    Storage::fake('public');

    $this->seed(CategorySeeder::class);
    $this->seed(ProductSeeder::class);

    $first = Product::query()->orderBy('sku')->pluck('image_path', 'sku');
    $count = Product::query()->count();

    $this->seed(ProductSeeder::class);

    expect(Product::query()->count())->toBe($count)
        ->and(Product::query()->orderBy('sku')->pluck('image_path', 'sku'))->toEqual($first);
});
