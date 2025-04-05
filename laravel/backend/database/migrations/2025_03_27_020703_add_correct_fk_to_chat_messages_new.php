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
            $table->foreign('sender_id')
            ->references('id')
            ->on('entre_inf')
            ->onDelete('cascade');
            
      $table->foreign('receiver_id')
            ->references('id')
            ->on('entre_inf')
            ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages_new', function (Blueprint $table) {
            $table->dropForeign(['sender_id']);
            $table->dropForeign(['receiver_id']);
        });
    }
};
