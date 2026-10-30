<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use App\Services\SaleService;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    /**
     * Demo carts seeded in order. The third sale is voided so the seed data
     * exercises both the completed and voided states.
     *
     * @var list<array{quantity: int, remarks: ?string}>
     */
    private const DEMO_SALES = [
        ['quantity' => 2, 'remarks' => 'Walk-in customer'],
        ['quantity' => 1, 'remarks' => 'Delivery order'],
        ['quantity' => 3, 'remarks' => 'Phone order'],
        ['quantity' => 2, 'remarks' => null],
    ];

    /**
     * Seed deterministic sales through SaleService so inventory quantities and
     * movement history always match the recorded sales.
     *
     * Re-running is safe: seeding is skipped once any sale exists.
     */
    public function run(): void
    {
        if (Sale::query()->exists()) {
            $this->command?->warn('Sales already exist — skipping SaleSeeder.');

            return;
        }

        $userId = User::query()->where('email', 'admin@test')->value('id');

        if ($userId === null) {
            $this->command?->warn('No admin user found — run UserSeeder first.');

            return;
        }

        $products = Product::query()
            ->whereHas('inventory', fn ($query) => $query->where('quantity', '>=', 3))
            ->orderBy('id')
            ->take(count(self::DEMO_SALES))
            ->get();

        if ($products->count() < count(self::DEMO_SALES)) {
            $this->command?->warn('Not enough stocked products — run InventorySeeder first.');

            return;
        }

        $service = app(SaleService::class);

        foreach (self::DEMO_SALES as $index => $demo) {
            $sale = $service->createSale([
                ['product_id' => $products[$index]->id, 'quantity' => $demo['quantity']],
            ], $userId, $demo['remarks']);

            if ($index === 2) {
                $service->voidSale($sale, $userId);
            }
        }
    }
}
