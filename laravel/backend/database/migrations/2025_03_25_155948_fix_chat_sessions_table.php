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
        Schema::table('chat_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('chat_sessions', 'status')) {
                $table->string('status')->default('active')->after('participant_id');
            }
            
            // Add conversation_sid if missing (from your original migration)
            if (!Schema::hasColumn('chat_sessions', 'conversation_sid')) {
                $table->string('conversation_sid')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
            //
        });
    }
};
