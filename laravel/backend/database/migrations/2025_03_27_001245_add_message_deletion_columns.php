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
        Schema::table('chat_messages_new', function (Blueprint $table) {
            $table->boolean('deleted_for_sender')->default(false);
            $table->boolean('deleted_for_receiver')->default(false);
            $table->boolean('deleted_for_all')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages_new', function (Blueprint $table) {
            $table->dropColumn(['deleted_for_sender', 'deleted_for_receiver', 'deleted_for_all']);
        });
    }
};
