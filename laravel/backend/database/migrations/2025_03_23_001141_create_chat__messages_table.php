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
        Schema::create('chat__messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chat_session_id'); // Chat session ID
            $table->unsignedBigInteger('sender_id'); // Sender ID (from EntreInf)
            $table->unsignedBigInteger('receiver_id'); // Receiver ID (from EntreInf)
            $table->text('message'); // Message content
            $table->string('message_sid')->nullable(); // Twilio message SID
            $table->timestamp('read_at')->nullable(); // Timestamp when the message was read
            $table->timestamps();

                        // Foreign keys
                        $table->foreign('chat_session_id')->references('id')->on('chat_sessions')->onDelete('cascade');
                        $table->foreign('sender_id')->references('id')->on('entre_inf')->onDelete('cascade');
                        $table->foreign('receiver_id')->references('id')->on('entre_inf')->onDelete('cascade');
                    
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat__messages');
    }
};
