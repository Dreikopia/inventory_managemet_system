<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    use WithoutModelEvents;

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
        'Contactor 24V 30A',
        'Condenser Fan Motor',
        'Igniter Kit for Gas Furnace',
        'Flame Sensor Assembly',
        'HVAC Belt Drive Pulley',
        '5000 BTU Portable Air Purifier',
        'True HEPA Tower Purifier',
        'Large Room Air Purifier',
        'UV Light Air Purifier',
        'Desktop HEPA Air Purifier',
        '20ft Insulated Duct Roll',
        '6in Adjustable Register Boot',
        'Galvanized Duct Clamp (10-Pack)',
        'Foil Duct Tape 2in x 60yd',
        'Duct Seam Mastic Sealant',
        'Smart Wi-Fi Thermostat',
        'Programmable 7-Day Thermostat',
        'Non-Programmable Thermostat',
        'Digital Thermostat with Humidity Sensor',
    ];

    /**
     * Seed the application's products.
     */
    public function run(): void
    {
        $categories = Category::all();

        if ($categories->isEmpty()) {
            $this->command?->warn('No categories found — run CategorySeeder first.');

            return;
        }

        foreach (self::PRODUCTS as $index => $name) {
            Product::factory()->create([
                'name' => $name,
                'category_id' => $categories[$index % $categories->count()]->id,
            ]);
        }

        // Flag a few products below their reorder level so low-stock
        // behaviour can be exercised against seeded data.
        Product::query()
            ->inRandomOrder()
            ->limit(3)
            ->get()
            ->each(function (Product $product) {
                $product->update([
                    'in_stock' => fake()->numberBetween(0, $product->reorder_level),
                ]);
            });
    }
}
