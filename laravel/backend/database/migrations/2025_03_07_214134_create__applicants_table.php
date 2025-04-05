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
        Schema::create('_applicants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_id'); // Define the job_id column
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('qualification')->nullable();
            $table->string('experienceLevel')->nullable();
            $table->string('educational_level')->nullable();
            $table->date('application_date');
            $table->string('status')->default('pending');
            $table->timestamps();

            // Add foreign key constraint
            $table->foreign('job_id')->references('id')->on('job_posting')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('_applicants');
    }
};
