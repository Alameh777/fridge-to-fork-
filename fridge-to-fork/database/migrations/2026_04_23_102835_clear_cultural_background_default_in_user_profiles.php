<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('cultural_background')->nullable()->default(null)->change();
        });

        DB::table('user_profiles')->where('cultural_background', 'moroccan')->update(['cultural_background' => null]);
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('cultural_background')->default('moroccan')->change();
        });
    }
};
