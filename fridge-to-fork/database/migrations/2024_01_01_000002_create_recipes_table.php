<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('title_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->json('ingredients');
            $table->json('steps');
            $table->json('steps_ar')->nullable();
            $table->integer('prep_time')->default(15);
            $table->integer('cook_time')->default(30);
            $table->integer('servings')->default(4);
            $table->string('cuisine');
            $table->string('image')->nullable();
            $table->boolean('is_halal')->default(true);
            $table->boolean('is_vegetarian')->default(false);
            $table->boolean('is_vegan')->default(false);
            $table->boolean('is_ramadan_friendly')->default(false);
            $table->boolean('is_ai_generated')->default(false);
            $table->boolean('is_community')->default(false);
            $table->json('tags')->nullable();
            $table->integer('likes')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
