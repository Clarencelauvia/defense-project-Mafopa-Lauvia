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
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Employer ID (from entre_inf)
            $table->unsignedBigInteger('participant_id'); // Other participant ID (from entre_inf)
            $table->string('conversation_sid'); // Twilio conversation SID
            $table->string('status')->default('active'); // Active, Inactive, etc.
            $table->timestamps();

                       // Foreign keys
                       $table->foreign('user_id')->references('id')->on('entre_inf')->onDelete('cascade');
                       $table->foreign('participant_id')->references('id')->on('entre_inf')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_sessions');
    }
};
