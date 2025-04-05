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
        Schema::create('employer_login_dates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entre_inf_id'); // Reference the `entre_inf` table
            $table->date('login_date');
            $table->timestamps();

            
            // Add foreign key constraint
            $table->foreign('entre_inf_id')
                  ->references('id')
                  ->on('entre_inf') // Reference the `entre_inf` table
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employer_login_dates');
    }
};
