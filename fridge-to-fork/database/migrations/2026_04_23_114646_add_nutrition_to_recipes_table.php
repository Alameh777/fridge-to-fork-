<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->integer('calories_per_serving')->nullable()->after('servings');
            $table->decimal('protein_g', 5, 1)->nullable()->after('calories_per_serving');
            $table->decimal('carbs_g', 5, 1)->nullable()->after('protein_g');
            $table->decimal('fat_g', 5, 1)->nullable()->after('carbs_g');
            $table->decimal('fiber_g', 5, 1)->nullable()->after('fat_g');
        });
    }

    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->dropColumn(['calories_per_serving', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g']);
        });
    }
};
