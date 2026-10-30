<?php

namespace App\Services;

use App\Enums\MovementType;
use App\Models\Inventory;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    /**
     * Add stock to an inventory and record the movement.
     *
     * @throws ValidationException
     */
    public function stockIn(Inventory $inventory, int $quantity, ?int $userId = null, ?string $remarks = null, ?int $saleId = null): InventoryMovement
    {
        $this->ensurePositive($quantity);

        return $this->applyChange($inventory, MovementType::STOCK_IN, $quantity, $userId, $saleId, $remarks);
    }

    /**
     * Remove stock from an inventory and record the movement.
     *
     * @throws ValidationException
     */
    public function stockOut(Inventory $inventory, int $quantity, ?int $userId = null, ?string $remarks = null, ?int $saleId = null): InventoryMovement
    {
        $this->ensurePositive($quantity);

        return $this->applyChange($inventory, MovementType::STOCK_OUT, -$quantity, $userId, $saleId, $remarks);
    }

    /**
     * Apply a signed change to the stock level and record the movement.
     *
     * @throws ValidationException
     */
    public function adjust(Inventory $inventory, int $change, ?int $userId = null, ?string $remarks = null): InventoryMovement
    {
        if ($change === 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Adjustment cannot be zero',
            ]);
        }

        return $this->applyChange($inventory, MovementType::ADJUSTMENT, $change, $userId, null, $remarks);
    }

    /**
     * Guard against quantities that should never reach the database.
     *
     * @throws ValidationException
     */
    private function ensurePositive(int $quantity): void
    {
        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity must be greater than zero',
            ]);
        }
    }

    /**
     * Lock the inventory row, apply the change, and write the audit movement.
     *
     * @throws ValidationException
     */
    private function applyChange(Inventory $inventory, MovementType $type, int $change, ?int $userId, ?int $saleId, ?string $remarks): InventoryMovement
    {
        return DB::transaction(function () use ($inventory, $type, $change, $userId, $saleId, $remarks): InventoryMovement {
            $locked = Inventory::query()->lockForUpdate()->findOrFail($inventory->id);

            $newQuantity = $locked->quantity + $change;

            if ($newQuantity < 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Not enough stock. Only {$locked->quantity} available.",
                ]);
            }

            $locked->update(['quantity' => $newQuantity]);

            // create the movement history
            return $locked->movements()->create([
                'user_id' => $userId,
                'sale_id' => $saleId,
                'type' => $type,
                'quantity' => $change,
                'remarks' => $remarks,
            ]);
        });
    }
}
