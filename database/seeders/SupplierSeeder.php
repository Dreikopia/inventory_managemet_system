<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Air-care suppliers seeded for the product catalog, keyed by name so
     * repeat seed runs resolve to the same rows.
     *
     * @var list<array{name: string, contact_person: string, phone: string, email: string, address: string}>
     */
    private const SUPPLIERS = [
        [
            'name' => 'Manila Climate Solutions',
            'contact_person' => 'Rowena Dela Cruz',
            'phone' => '+63 2 8555 0142',
            'email' => 'sales@manilaclimate.ph',
            'address' => '1231 Chino Roces Avenue, Makati City, Metro Manila',
        ],
        [
            'name' => 'Pacific HVAC Supply',
            'contact_person' => 'Jerome Ramos',
            'phone' => '+63 32 238 7715',
            'email' => 'orders@pacifichvac.ph',
            'address' => '88 Escario Street, Cebu City 6000',
        ],
        [
            'name' => 'AeroCool Distributors',
            'contact_person' => 'Maria Santos',
            'phone' => '+63 2 8721 3390',
            'email' => 'hello@aerocooldist.ph',
            'address' => '5th Avenue, Bonifacio Global City, Taguig City',
        ],
        [
            'name' => 'Cebu Air Systems',
            'contact_person' => 'Anna Villanueva',
            'phone' => '+63 32 412 8864',
            'email' => 'anna@cebuairsystems.ph',
            'address' => '22 Osmeña Boulevard, Cebu City 6000',
        ],
        [
            'name' => 'Norte Refrigeration Supply',
            'contact_person' => 'Paolo Bautista',
            'phone' => '+63 72 700 4418',
            'email' => 'supply@norterefrig.ph',
            'address' => 'Quezon Avenue, San Fernando, La Union 2500',
        ],
    ];

    /**
     * Seed the application's suppliers.
     */
    public function run(): void
    {
        foreach (self::SUPPLIERS as $supplier) {
            Supplier::query()->firstOrCreate(
                ['name' => $supplier['name']],
                $supplier + ['is_active' => true],
            );
        }
    }
}
