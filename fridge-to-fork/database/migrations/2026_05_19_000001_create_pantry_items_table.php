<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pantry_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('quantity', 8, 2)->default(1);
            $table->string('unit')->default('pieces');
            $table->date('expiry_date')->nullable();
            $table->string('barcode')->nullable();
            $table->string('brand')->nullable();
            $table->integer('calories_per_100g')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pantry_items');
    }
};
