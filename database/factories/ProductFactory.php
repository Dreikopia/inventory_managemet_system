<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucwords(fake()->unique()->words(3, true)),
            'sku' => strtoupper(fake()->unique()->bothify('AC-#####')),
            'category_id' => Category::factory(),
            'in_stock' => fake()->numberBetween(0, 500),
            'unit_price' => fake()->randomFloat(2, 5, 500),
            'reorder_level' => fake()->numberBetween(3, 20),
        ];
    }

    /**
     * Indicate that the product is at or below its reorder level.
     */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'in_stock' => fake()->numberBetween(0, $attributes['reorder_level']),
        ]);
    }
}
