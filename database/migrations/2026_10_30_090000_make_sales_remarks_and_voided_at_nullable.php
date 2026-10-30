<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The sales table was created before remarks and voided_at were declared
     * nullable, so MySQL strict mode rejects every sale that leaves voided_at
     * unset. Align the existing table with the original migration.
     */
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->text('remarks')->nullable()->change();
            $table->timestamp('voided_at')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->text('remarks')->nullable(false)->change();
            $table->timestamp('voided_at')->nullable(false)->change();
        });
    }
};
