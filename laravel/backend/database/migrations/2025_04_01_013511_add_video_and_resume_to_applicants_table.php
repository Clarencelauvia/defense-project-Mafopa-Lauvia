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
            $table->string('video_url')->nullable()->after('status');
            $table->string('resume_url')->nullable()->after('video_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('_applicants', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'resume_url']);
        });
    }
};
