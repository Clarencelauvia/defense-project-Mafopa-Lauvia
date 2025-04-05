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
        Schema::table('entre_inf', function (Blueprint $table) {
            $table->string('contact_number', 15)->change(); // Change to VARCHAR
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entre_inf', function (Blueprint $table) {
            $table->integer('contact_number')->change(); // Revert to INT
        });
    }
};
