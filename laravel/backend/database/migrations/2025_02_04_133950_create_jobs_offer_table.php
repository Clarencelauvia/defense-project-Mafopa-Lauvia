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
        Schema::create('jobs_offer', function (Blueprint $table) {
            $table->id();
            $table->string('job_title');
            $table->string('education_level');
            $table->string('job_description');
            $table->integer('salary_range');
            $table->string('job_category');
            $table->string('experience_level');
            $table->string('compagny_description');
            $table->string('skill_required');
            $table->string('job_type');
            $table->string('job_duration');
            $table->string('location');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs_offer');
    }
};
