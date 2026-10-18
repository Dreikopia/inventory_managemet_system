<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

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

it('updates a product', function () {
    $product = Product::factory()->create([
        'name' => 'Old Name',
        'sku' => 'AC-UPDATE-01',
        'in_stock' => 5,
    ]);
    $category = Category::factory()->create();

    $response = $this->put(route('products.update', $product), [
        'name' => 'New Name',
        'sku' => $product->sku,
        'category_id' => $category->id,
        'in_stock' => 88,
        'unit_price' => 42.50,
        'reorder_level' => 12,
    ]);

    $response
        ->assertRedirect(route('products'))
        ->assertSessionHas('success', 'Product updated successfully.');

    expect($product->fresh())
        ->name->toBe('New Name')
        ->category_id->toBe($category->id)
        ->in_stock->toBe(88)
        ->unit_price->toBe(42.50)
        ->reorder_level->toBe(12);
});

it('replaces the product image and deletes the previous file', function () {
    Storage::fake('public');
    $product = Product::factory()->withImage()->create();
    $originalPath = $product->image_path;

    $response = $this->put(route('products.update', $product), [
        'name' => $product->name,
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'in_stock' => $product->in_stock,
        'unit_price' => $product->unit_price,
        'reorder_level' => $product->reorder_level,
        'image' => UploadedFile::fake()->image('replacement.png'),
    ]);

    $response->assertRedirect(route('products'));

    $product->refresh();

    expect($product->image_path)->toStartWith('images/products/')
        ->and($product->image_path)->not->toBe($originalPath);

    Storage::disk('public')->assertExists($product->image_path);
    Storage::disk('public')->assertMissing($originalPath);
});

it('removes the product image when asked and no new file is sent', function () {
    Storage::fake('public');
    $product = Product::factory()->withImage()->create();
    $originalPath = $product->image_path;

    $response = $this->put(route('products.update', $product), [
        'name' => $product->name,
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'in_stock' => $product->in_stock,
        'unit_price' => $product->unit_price,
        'reorder_level' => $product->reorder_level,
        'remove_image' => true,
    ]);

    $response->assertRedirect(route('products'));

    expect($product->fresh()->image_path)->toBeNull();
    Storage::disk('public')->assertMissing($originalPath);
});

it('keeps the existing product image when neither is sent', function () {
    Storage::fake('public');
    $product = Product::factory()->withImage()->create();
    $originalPath = $product->image_path;

    $this->put(route('products.update', $product), [
        'name' => $product->name,
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'in_stock' => 77,
        'unit_price' => $product->unit_price,
        'reorder_level' => $product->reorder_level,
    ])->assertRedirect(route('products'));

    expect($product->fresh()->image_path)->toBe($originalPath);
    Storage::disk('public')->assertExists($originalPath);
});

it('rejects an update with required fields missing', function () {
    $product = Product::factory()->create();

    $response = $this->put(route('products.update', $product), []);

    $response->assertSessionHasErrors(['name', 'sku', 'category_id', 'in_stock', 'unit_price', 'reorder_level']);

    expect($product->fresh()->name)->toBe($product->name);
});

it('allows a product to keep its own sku on update', function () {
    $product = Product::factory()->create(['sku' => 'AC-KEEP-01']);

    $response = $this->put(route('products.update', $product), [
        'name' => $product->name,
        'sku' => 'AC-KEEP-01',
        'category_id' => $product->category_id,
        'in_stock' => $product->in_stock,
        'unit_price' => $product->unit_price,
        'reorder_level' => $product->reorder_level,
    ]);

    $response->assertRedirect(route('products'));
    $response->assertSessionHasNoErrors();
});

it('rejects an update with a sku taken by another product', function () {
    $taken = Product::factory()->create(['sku' => 'AC-TAKEN']);
    $product = Product::factory()->create(['sku' => 'AC-OWNER']);

    $response = $this->put(route('products.update', $product), [
        'name' => $product->name,
        'sku' => $taken->sku,
        'category_id' => $product->category_id,
        'in_stock' => $product->in_stock,
        'unit_price' => $product->unit_price,
        'reorder_level' => $product->reorder_level,
    ]);

    $response->assertSessionHasErrors('sku');

    expect($product->fresh()->sku)->toBe('AC-OWNER');
});

it('rejects an update when the image is not a supported image file', function () {
    $product = Product::factory()->create();

    $response = $this->put(route('products.update', $product), [
        'name' => $product->name,
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'in_stock' => $product->in_stock,
        'unit_price' => $product->unit_price,
        'reorder_level' => $product->reorder_level,
        'image' => UploadedFile::fake()->create('manual.txt', 12, 'text/plain'),
    ]);

    $response->assertSessionHasErrors('image');
});

it('adds an image to a product that has none without touching the disk', function () {
    Storage::fake('public');
    $product = Product::factory()->create(['image_path' => null]);

    $response = $this->put(route('products.update', $product), [
        'name' => $product->name,
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'in_stock' => $product->in_stock,
        'unit_price' => $product->unit_price,
        'reorder_level' => $product->reorder_level,
        'image' => UploadedFile::fake()->image('first.png'),
    ]);

    $response->assertRedirect(route('products'));

    $product->refresh();

    expect($product->image_path)->toStartWith('images/products/');
    Storage::disk('public')->assertExists($product->image_path);
});

it('keeps the existing product image when remove_image is sent as false', function () {
    Storage::fake('public');
    $product = Product::factory()->withImage()->create();

    // Inertia writes booleans into FormData as "1"/"0".
    $response = $this->put(route('products.update', $product), [
        'name' => $product->name,
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'in_stock' => $product->in_stock,
        'unit_price' => $product->unit_price,
        'reorder_level' => $product->reorder_level,
        'remove_image' => '0',
    ]);

    $response->assertSessionHasNoErrors();

    $product->refresh();

    expect($product->image_path)->not->toBeNull();
    Storage::disk('public')->assertExists($product->image_path);
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
