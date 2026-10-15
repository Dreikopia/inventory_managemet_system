<?php

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('creates a product with an uploaded image', function () {
    Storage::fake('public');
    $category = Category::factory()->create();

    $response = $this->post(route('products.store'), [
        'name' => '20x20x1 MERV 11 Filter',
        'sku' => 'AC-TEST-01',
        'category_id' => $category->id,
        'in_stock' => 120,
        'unit_price' => 19.99,
        'reorder_level' => 25,
        'image' => UploadedFile::fake()->image('filter.jpg'),
    ]);

    $response
        ->assertRedirect(route('products'))
        ->assertSessionHas('success', 'Product created successfully.');

    $product = Product::query()->where('sku', 'AC-TEST-01')->first();

    expect($product)->not->toBeNull()
        ->and($product->name)->toBe('20x20x1 MERV 11 Filter')
        ->and($product->category_id)->toBe($category->id)
        ->and($product->in_stock)->toBe(120)
        ->and($product->reorder_level)->toBe(25)
        ->and($product->image_path)->toStartWith('images/products/');

    Storage::disk('public')->assertExists($product->image_path);
});

it('creates a product without an image', function () {
    $category = Category::factory()->create();

    $response = $this->post(route('products.store'), [
        'name' => 'Smart Wi-Fi Thermostat',
        'sku' => 'AC-TEST-02',
        'category_id' => $category->id,
        'in_stock' => 40,
        'unit_price' => 149.00,
        'reorder_level' => 10,
    ]);

    $response->assertRedirect(route('products'));

    $product = Product::query()->where('sku', 'AC-TEST-02')->first();

    expect($product)->not->toBeNull()
        ->and($product->image_path)->toBeNull();
});

it('rejects a product when the image is not a supported image file', function () {
    $category = Category::factory()->create();

    $response = $this->post(route('products.store'), [
        'name' => 'Duct Seam Mastic Sealant',
        'sku' => 'AC-TEST-03',
        'category_id' => $category->id,
        'in_stock' => 15,
        'unit_price' => 9.50,
        'reorder_level' => 5,
        'image' => UploadedFile::fake()->create('manual.txt', 12, 'text/plain'),
    ]);

    $response->assertSessionHasErrors('image');

    expect(Product::query()->where('sku', 'AC-TEST-03')->exists())->toBeFalse();
});

it('rejects a product with required fields missing', function () {
    $response = $this->post(route('products.store'), []);

    $response->assertSessionHasErrors(['name', 'sku', 'category_id', 'in_stock', 'unit_price', 'reorder_level']);

    $this->assertDatabaseCount('products', 0);
});

it('rejects a product with a duplicate sku', function () {
    $product = Product::factory()->create(['sku' => 'AC-DUPLICATE']);

    $response = $this->post(route('products.store'), [
        'name' => 'Another Filter',
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'in_stock' => 10,
        'unit_price' => 12.00,
        'reorder_level' => 4,
    ]);

    $response->assertSessionHasErrors('sku');

    $this->assertDatabaseCount('products', 1);
});

it('lists products with their appended stock status and image url', function () {
    Storage::fake('public');

    Product::factory()->create([
        'sku' => 'AC-LIST-01',
        'in_stock' => 100,
        'reorder_level' => 10,
    ]);
    $withImage = Product::factory()->withImage()->create(['sku' => 'AC-LIST-02']);

    $this->get(route('products'))
        ->assertOk()
        ->assertInertia(function (Assert $page) use ($withImage) {
            $page->component('Products/Index')
                ->has('products', 2)
                ->where('products', function (Collection $products) use ($withImage) {
                    $bySku = $products->keyBy('sku');

                    expect($bySku['AC-LIST-01']['stock_status'])->toBe([
                        'value' => 'in_stock',
                        'label' => 'In stock',
                    ])
                        ->and($bySku['AC-LIST-01']['image_url'])->toBeNull()
                        ->and($bySku['AC-LIST-02']['stock_status']['value'])->toBe('in_stock')
                        ->and($bySku['AC-LIST-02']['image_url'])
                        ->toBe(Storage::disk('public')->url($withImage->image_path));

                    return true;
                });
        });
});
