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
             // Check if columns exist before adding
        if (!Schema::hasColumn('chat_sessions', 'user_id')) {
            $table->unsignedBigInteger('user_id');
        }
        if (!Schema::hasColumn('chat_sessions', 'participant_id')) {
            $table->unsignedBigInteger('participant_id');
        }
        if (!Schema::hasColumn('chat_sessions', 'conversation_sid')) {
            $table->string('conversation_sid')->nullable();
        }

        
            // Check if foreign key constraints exist before adding
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'chat_sessions' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ");
   // Add foreign keys only if they don't exist
   $existingForeignKeys = collect($foreignKeys)->pluck('CONSTRAINT_NAME');

   if (!$existingForeignKeys->contains('chat_sessions_user_id_foreign')) {
       $table->foreign('user_id')
           ->references('id')
           ->on('entre_inf')
           ->onDelete('cascade');
   }
   if (!$existingForeignKeys->contains('chat_sessions_participant_id_foreign')) {
       $table->foreign('participant_id')
           ->references('id')
           ->on('entre_inf')
           ->onDelete('cascade');
   }
        // // Add foreign keys if they don't exist
        // $table->foreign('user_id')->references('id')->on('entre_inf')->onDelete('cascade');
        // $table->foreign('participant_id')->references('id')->on('entre_inf')->onDelete('cascade');
        
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
               // Drop foreign keys if they exist
               $table->dropForeignIfExists('chat_sessions_user_id_foreign');
               $table->dropForeignIfExists('chat_sessions_participant_id_foreign');
        });
    }
};
