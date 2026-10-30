<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The existing sale_items table was created with a sub_total column that
     * the model and service no longer use. Rename it so sale items can be
     * written; fresh installs already have the correct column.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('sale_items', 'sub_total') || Schema::hasColumn('sale_items', 'subtotal')) {
            return;
        }

        Schema::table('sale_items', function (Blueprint $table) {
            $table->renameColumn('sub_total', 'subtotal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('sale_items', 'subtotal')) {
            return;
        }

        Schema::table('sale_items', function (Blueprint $table) {
            $table->renameColumn('subtotal', 'sub_total');
        });
    }
};
