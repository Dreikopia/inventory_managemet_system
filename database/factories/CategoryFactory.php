<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Realistic air-care category names shared with the seeders.
     *
     * @var list<string>
     */
    public const NAMES = [
        'Air Filters',
        'HEPA Filters',
        'HVAC Parts',
        'Air Purifiers',
        'Ductwork',
        'Thermostats',
        'Air Conditioners',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucwords(fake()->unique()->words(2, true)),
        ];
    }
}
