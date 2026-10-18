<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ProductSeeder extends Seeder
{
    /**
     * Realistic air-care product names, assigned to categories round-robin.
     *
     * @var list<string>
     */
    private const PRODUCTS = [
        '16x25x1 Pleated Air Filter',
        '20x20x1 MERV 11 Filter',
        '14x14x1 Carbon Air Filter',
        '4x10x1 Furnace Filter',
        '20x25x2 HEPA Filter',
        '16x20x1 HEPA Filter',
        'True HEPA Replacement Cartridge',
        'HEPA Media Filter Pack (3-Pack)',
        'Whole-Home HEPA Media Cabinet',
        'Universal Blower Motor',
        'HVAC Capacitor 45/5 MFD',
        'Digital Thermostat with Humidity Sensor',
        'GREE Outdoor Condenser Unit',
        'LG Inverter Wall-Mounted Split AC',
        'Soleus Window Air Conditioner',
        'Mitsubishi Wall-Mounted Split AC',
        'Condenser Fan Blade',
    ];

    /**
     * Source image for products that ship with one, keyed by product name.
     * Files live in database/seeders/images/products and are copied onto the
     * public disk under a deterministic SKU-based filename.
     *
     * @var array<string, string>
     */
    private const PRODUCT_IMAGES = [
        'GREE Outdoor Condenser Unit' => 'gree-outdoor-condenser-unit.png',
        'LG Inverter Wall-Mounted Split AC' => 'lg-inverter-wall-mounted-split.png',
        'Soleus Window Air Conditioner' => 'soleus-window-air-conditioner.png',
        'Mitsubishi Wall-Mounted Split AC' => 'mitsubishi-wall-mounted-split.png',
        'Condenser Fan Blade' => 'condenser-fan-blade.webp',
    ];

    /**
     * Seed the application's products.
     */
    public function run(): void
    {
        $categories = Category::query()->orderBy('id')->get();

        if ($categories->isEmpty()) {
            $this->command?->warn('No categories found — run CategorySeeder first.');

            return;
        }

        $seeded = collect();

        foreach (self::PRODUCTS as $index => $name) {
            $sku = sprintf('AC-%05d', $index + 1);

            $image = self::PRODUCT_IMAGES[$name] ?? null;
            $imagePath = $image === null ? null : $this->storeImage($sku, $image);

            $product = Product::query()->firstOrCreate(
                ['sku' => $sku],
                Product::factory()->raw([
                    'sku' => $sku,
                    'name' => $name,
                    'category_id' => $this->categoryIdFor($name, $categories, $index),
                    'image_path' => $imagePath,
                ]),
            );

            // Backfill the image on products that were seeded before images existed.
            if ($imagePath !== null && $product->image_path === null) {
                $product->update(['image_path' => $imagePath]);
            }

            if ($product->wasRecentlyCreated) {
                $seeded->push($product);
            }
        }

        // Flag a few newly seeded products below their reorder level so
        // low-stock behaviour can be exercised against seeded data.
        $seeded->random(min(3, $seeded->count()))->each(function (Product $product) {
            $product->update([
                'in_stock' => fake()->numberBetween(0, $product->reorder_level),
            ]);
        });
    }

    /**
     * Air-conditioner products land in the Air Conditioners category; the
     * remaining products are assigned round-robin across all categories.
     *
     * @param  Collection<int, Category>  $categories
     */
    private function categoryIdFor(string $name, Collection $categories, int $index): int
    {
        $category = isset(self::PRODUCT_IMAGES[$name])
            ? $categories->firstWhere('name', 'Air Conditioners')
            : null;

        return ($category ?? $categories[$index % $categories->count()])->id;
    }

    /**
     * Copy a committed seed image onto the public disk under a deterministic
     * SKU-based filename, returning the stored path or null when the source
     * file is missing.
     */
    private function storeImage(string $sku, string $filename): ?string
    {
        $source = database_path('seeders/images/products/'.$filename);
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $path = sprintf('images/products/%s.%s', strtolower($sku), $extension);

        if (! is_file($source)) {
            $this->command?->warn("Missing seed image [{$filename}] — skipping for SKU {$sku}.");

            return null;
        }

        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, File::get($source));
        }

        return $path;
    }
}
