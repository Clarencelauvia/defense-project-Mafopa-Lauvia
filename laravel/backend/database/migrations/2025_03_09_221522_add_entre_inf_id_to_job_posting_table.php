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
        if (!Schema::hasColumn('job_posting', 'entre_inf_id')) {
            Schema::table('job_posting', function (Blueprint $table) {
                $table->unsignedBigInteger('entre_inf_id')->after('id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('job_posting', 'entre_inf_id')) {
            Schema::table('job_posting', function (Blueprint $table) {
                $table->dropColumn('entre_inf_id');
            });
        }
    }
};
