<?php

namespace Database\Seeders;

use App\Models\Category;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed the application's categories.
     */
    public function run(): void
    {
        foreach (CategoryFactory::NAMES as $name) {
            Category::query()->firstOrCreate(['name' => $name]);
        }
    }
}
