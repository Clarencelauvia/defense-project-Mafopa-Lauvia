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
        Schema::create('job_posting', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entre_inf_id');
            $table->string('job_title');
            $table->string('educational_level');
            $table->string('job_description');
            $table->string('salary_range');
            $table->string('job_category');
            $table->string('experience_level');
            $table->string('company_description');
            $table->string('skill_required');
            $table->string('job_type');
            $table->string('job_duration');
            $table->string('location');
            $table->timestamps();

            $table->foreign('entre_inf_id')->references('id')->on('entre_inf')->onDelete('cascade');
           
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posting');
    }
};
