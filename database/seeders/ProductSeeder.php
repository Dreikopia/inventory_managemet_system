<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ProductSeeder extends Seeder
{
    /**
     * Air-conditioner products seeded with an image, in image order.
     * Each entry is paired with the matching file in PRODUCT_IMAGES and
     * assigned to the Air Conditioners category.
     *
     * @var list<string>
     */
    private const AIR_CONDITIONERS = [
        'Soleus Air Window Air Conditioner',
        'LG Inverter V Wall-Mounted Split AC',
        '10,000 BTU Slider Window Air Conditioner',
        'Soleus Air 8,000 BTU Window Air Conditioner',
        'LG Inverter V Slim Wall-Mounted Split AC',
        'Soleus Air 12,000 BTU Window Air Conditioner',
        'LG Artcool Inverter Wall-Mounted Split AC',
        '12,000 BTU Window Air Conditioner',
        'Mitsubishi Heavy Industries Wall-Mounted Split AC',
        'Electrolux AirGate Wall-Mounted Split AC',
    ];

    /**
     * Products seeded without an image, assigned round-robin across the
     * non-air-conditioner categories.
     *
     * @var list<string>
     */
    private const OTHER_PRODUCTS = [
        '16x25x1 Pleated Air Filter',
        '20x20x1 MERV 11 Filter',
        '4x10x1 Furnace Filter',
        '20x25x2 HEPA Filter',
        'True HEPA Replacement Cartridge',
        'HEPA Media Filter Pack (3-Pack)',
        'Whole-Home HEPA Media Cabinet',
        'Universal Blower Motor',
        'HVAC Capacitor 45/5 MFD',
        'Digital Thermostat with Humidity Sensor',
    ];

    /**
     * Source image for each air-conditioner product, keyed by product name.
     * Files live in database/seeders/images/products and are copied onto the
     * public disk under a deterministic SKU-based filename.
     *
     * @var array<string, string>
     */
    private const PRODUCT_IMAGES = [
        'Soleus Air Window Air Conditioner' => 'ac1.png',
        'LG Inverter V Wall-Mounted Split AC' => 'ac2.png',
        '10,000 BTU Slider Window Air Conditioner' => 'ac3.png',
        'Soleus Air 8,000 BTU Window Air Conditioner' => 'ac4.png',
        'LG Inverter V Slim Wall-Mounted Split AC' => 'ac5.png',
        'Soleus Air 12,000 BTU Window Air Conditioner' => 'ac6.png',
        'LG Artcool Inverter Wall-Mounted Split AC' => 'ac7.png',
        '12,000 BTU Window Air Conditioner' => 'ac8.png',
        'Mitsubishi Heavy Industries Wall-Mounted Split AC' => 'ac9.png',
        'Electrolux AirGate Wall-Mounted Split AC' => 'ac10.png',
    ];

    /**
     * Categories the non-air-conditioner products are distributed across.
     * Excludes Air Conditioners, which only receives seeded image products.
     *
     * @var list<string>
     */
    private const OTHER_CATEGORY_NAMES = [
        'Air Filters',
        'HEPA Filters',
        'HVAC Parts',
        'Air Purifiers',
        'Ductwork',
        'Thermostats',
    ];

    /**
     * Seed the application's products: 10 air conditioners with images and
     * 10 products across the remaining categories without images.
     */
    public function run(): void
    {
        $categories = Category::query()->orderBy('id')->get();

        if ($categories->isEmpty()) {
            $this->command?->warn('No categories found — run CategorySeeder first.');

            return;
        }

        $airConditionerCategory = $categories->firstWhere('name', 'Air Conditioners');
        $otherCategories = $categories
            ->filter(fn (Category $category): bool => in_array($category->name, self::OTHER_CATEGORY_NAMES, true))
            ->values();

        if ($airConditionerCategory === null || $otherCategories->isEmpty()) {
            $this->command?->warn('Missing required categories — run CategorySeeder first.');

            return;
        }

        $suppliers = Supplier::query()->orderBy('id')->get();

        if ($suppliers->isEmpty()) {
            $this->command?->warn('No suppliers found — run SupplierSeeder first.');
        }

        $seeded = collect();

        foreach (self::AIR_CONDITIONERS as $index => $name) {
            $product = $this->seedProduct($name, $index, $airConditionerCategory->id, $seeded);
        }

        foreach (self::OTHER_PRODUCTS as $index => $name) {
            $category = $otherCategories[$index % $otherCategories->count()];

            // Offset so non-AC products continue the SKU sequence after the
            // air conditioners instead of reusing AC-00001 through AC-00010.
            $this->seedProduct($name, $index + count(self::AIR_CONDITIONERS), $category->id, $seeded);
        }

        // Associate 70% of the newly seeded products with suppliers so
        // supplier relationships can be exercised against seeded data.
        $this->associateSuppliers($seeded, $suppliers);

    }

    /**
     * Create a seeded product under a deterministic SKU, copying its image
     * onto the public disk when one is defined for it.
     *
     * @param  Collection<int, Product>  $seeded
     */
    private function seedProduct(string $name, int $index, int $categoryId, Collection $seeded): Product
    {
        $sku = sprintf('AC-%05d', $index + 1);

        $image = self::PRODUCT_IMAGES[$name] ?? null;
        $imagePath = $image === null ? null : $this->storeImage($sku, $image);

        $product = Product::query()->firstOrCreate(
            ['sku' => $sku],
            Product::factory()->raw([
                'sku' => $sku,
                'name' => $name,
                'category_id' => $categoryId,
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

        return $product;
    }

    /**
     * Associate 70% of the newly seeded products with a supplier, assigned
     * round-robin across the available suppliers in seeding order. Products
     * seeded before suppliers existed are left untouched on repeat runs.
     *
     * @param  Collection<int, Product>  $seeded
     * @param  Collection<int, Supplier>  $suppliers
     */
    private function associateSuppliers(Collection $seeded, Collection $suppliers): void
    {
        if ($seeded->isEmpty() || $suppliers->isEmpty()) {
            return;
        }

        $seeded
            ->take((int) ceil($seeded->count() * 0.7))
            ->each(function (Product $product, int $slot) use ($suppliers): void {
                $product->update([
                    'supplier_id' => $suppliers[$slot % $suppliers->count()]->id,
                ]);
            });
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
