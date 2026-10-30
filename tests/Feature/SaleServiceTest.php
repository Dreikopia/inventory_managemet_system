<?php

use App\Enums\MovementType;
use App\Enums\SaleStatus;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Services\SaleService;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = app(SaleService::class);
});

it('creates a completed sale with a sales number and remarks', function () {
    $product = Product::factory()->create(['unit_price' => 25.50]);
    Inventory::factory()->for($product)->create(['quantity' => 10]);

    $sale = $this->service->createSale([
        ['product_id' => $product->id, 'quantity' => 2],
    ], $this->user->id, 'Walk-in customer');

    expect($sale->sales_number)->toBe('S-0001')
        ->and($sale->status)->toBe(SaleStatus::COMPLETED)
        ->and($sale->remarks)->toBe('Walk-in customer')
        ->and((float) $sale->total_amount)->toBe(51.0)
        ->and($sale->user_id)->toBe($this->user->id);
});

it('stores the unit price and subtotal on each sale item', function () {
    $product = Product::factory()->create(['unit_price' => 25.50]);
    Inventory::factory()->for($product)->create(['quantity' => 10]);

    $sale = $this->service->createSale([
        ['product_id' => $product->id, 'quantity' => 2],
    ], $this->user->id);

    $item = $sale->items()->sole();

    expect($item->product_id)->toBe($product->id)
        ->and($item->quantity)->toBe(2)
        ->and((float) $item->unit_price)->toBe(25.5)
        ->and((float) $item->subtotal)->toBe(51.0);
});

it('deducts inventory and records a stock out movement linked to the sale', function () {
    $product = Product::factory()->create(['unit_price' => 10.00]);
    $inventory = Inventory::factory()->for($product)->create(['quantity' => 10]);

    $sale = $this->service->createSale([
        ['product_id' => $product->id, 'quantity' => 3],
    ], $this->user->id);

    expect($inventory->fresh()->quantity)->toBe(7);

    $movement = $inventory->movements()->sole();

    expect($movement->type)->toBe(MovementType::STOCK_OUT)
        ->and($movement->quantity)->toBe(-3)
        ->and($movement->sale_id)->toBe($sale->id)
        ->and($movement->user_id)->toBe($this->user->id)
        ->and($movement->remarks)->toBe("Sale {$sale->sales_number}");
});

it('totals the subtotals of multiple sale items', function () {
    $first = Product::factory()->create(['unit_price' => 10.00]);
    $second = Product::factory()->create(['unit_price' => 5.00]);

    Inventory::factory()->for($first)->create(['quantity' => 10]);
    Inventory::factory()->for($second)->create(['quantity' => 10]);

    $sale = $this->service->createSale([
        ['product_id' => $first->id, 'quantity' => 3],
        ['product_id' => $second->id, 'quantity' => 4],
    ], $this->user->id);

    expect((float) $sale->total_amount)->toBe(50.0)
        ->and($sale->items()->count())->toBe(2)
        ->and($first->inventory->fresh()->quantity)->toBe(7)
        ->and($second->inventory->fresh()->quantity)->toBe(6);
});

it('rolls back the sale when the stock is insufficient', function () {
    $product = Product::factory()->create(['unit_price' => 10.00]);
    $inventory = Inventory::factory()->for($product)->create(['quantity' => 1]);

    expect(fn () => $this->service->createSale([
        ['product_id' => $product->id, 'quantity' => 2],
    ], $this->user->id))->toThrow(ValidationException::class);

    expect(Sale::count())->toBe(0)
        ->and(SaleItem::count())->toBe(0)
        ->and($inventory->fresh()->quantity)->toBe(1)
        ->and($inventory->movements()->count())->toBe(0);
});

it('voids a sale and stamps the voided timestamp', function () {
    $product = Product::factory()->create(['unit_price' => 10.00]);
    Inventory::factory()->for($product)->create(['quantity' => 10]);

    $sale = $this->service->createSale([
        ['product_id' => $product->id, 'quantity' => 2],
    ], $this->user->id);

    $voided = $this->service->voidSale($sale, $this->user->id);

    expect($voided->status)->toBe(SaleStatus::VOIDED)
        ->and($voided->voided_at)->not->toBeNull();
});

it('restores the inventory when a sale is voided', function () {
    $product = Product::factory()->create(['unit_price' => 10.00]);
    $inventory = Inventory::factory()->for($product)->create(['quantity' => 10]);

    $sale = $this->service->createSale([
        ['product_id' => $product->id, 'quantity' => 3],
    ], $this->user->id);

    $this->service->voidSale($sale, $this->user->id);

    expect($inventory->fresh()->quantity)->toBe(10);

    $movement = $inventory->movements()->where('type', MovementType::STOCK_IN)->sole();

    expect($movement->quantity)->toBe(3)
        ->and($movement->sale_id)->toBe($sale->id)
        ->and($movement->user_id)->toBe($this->user->id);
});

it('rejects voiding a sale twice without restoring stock again', function () {
    $product = Product::factory()->create(['unit_price' => 10.00]);
    $inventory = Inventory::factory()->for($product)->create(['quantity' => 10]);

    $sale = $this->service->createSale([
        ['product_id' => $product->id, 'quantity' => 3],
    ], $this->user->id);

    $this->service->voidSale($sale, $this->user->id);

    expect(fn () => $this->service->voidSale($sale, $this->user->id))
        ->toThrow(ValidationException::class);

    expect($inventory->fresh()->quantity)->toBe(10)
        ->and($inventory->movements()->count())->toBe(2);
});
