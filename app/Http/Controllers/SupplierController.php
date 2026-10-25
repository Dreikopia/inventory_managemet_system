<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierRequest;
use App\Models\Supplier;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        return Inertia::render('Suppliers/Index', [
            'suppliers' => Supplier::all(),
        ]);
    }

    public function store(SupplierRequest $request)
    {
        $validated = $request->validated();

        Supplier::create($validated);

        return redirect()->route('suppliers')->with('success', 'Supplier has been created');
    }

    public function update(SupplierRequest $request, Supplier $supplier)
    {

        $validated = $request->validated();

        $supplier->update($validated);

        return redirect()->route('suppliers')->with('success', 'Supplier has been updated');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->route('suppliers')->with('success', 'Supplier deleted updated');
    }
}
