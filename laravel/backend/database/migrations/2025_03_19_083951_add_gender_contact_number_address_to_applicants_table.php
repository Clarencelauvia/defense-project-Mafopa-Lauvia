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
        Schema::table('_applicants', function (Blueprint $table) {
            $table->string('gender')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('address')->nullable();
           
    
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('_applicants', function (Blueprint $table) {
            $table->dropColumn(['gender', 'contact_number', 'address']);
        });
    }
};
