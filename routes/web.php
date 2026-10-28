<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'index'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {

    Route::delete('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/products', [ProductController::class, 'index'])->name('products');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
    Route::post('/categories', [CategoryController::class, 'store'])->name('category.store');
    Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('category.update');

    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::patch('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');

    Route::get('/inventories', [InventoryController::class, 'index'])->name('inventories');

    Route::post('/inventories/{inventory}/stock-in', [InventoryMovementController::class, 'stockIn'])->name('stock-in');
    Route::post('/inventories/{inventory}/stock-out', [InventoryMovementController::class, 'stockOut'])->name('stock-out');
    Route::post('/inventories/{inventory}/adjustment', [InventoryMovementController::class, 'adjustment'])->name('adjustment');

});
