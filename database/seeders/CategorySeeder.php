<?php

namespace Database\Seeders;

use App\Models\Category;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's categories.
     */
    public function run(): void
    {
        foreach (CategoryFactory::NAMES as $name) {
            Category::factory()->create(['name' => $name]);
        }
    }
}
