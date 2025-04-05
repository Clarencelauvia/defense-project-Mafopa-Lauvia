<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

    protected $table = 'chat_messages_new';
    protected $fillable = [
        'chat_session_id', // ID of the chat session
        'sender_id', // ID of the sender (from EntreInf)
        'receiver_id', // ID of the receiver (from EntreInf)
        'message', // The message content
        'read_at', // Timestamp when the message was read
        'is_deleted', // Add this line
        'deleted_for_sender',
        'deleted_for_receiver',
        'deleted_for_all'
    ];

    protected $dates = [
        'read_at',
        'created_at',
        'updated_at'
    ];

      // Relationship to ChatSession
      public function chatSession()
      {
          return $this->belongsTo(ChatSession::class);
      }
      public function session()
      {
          return $this->belongsTo(ChatSession::class, 'chat_session_id');
      }
  
      // Relationship to EntreInf (sender)
      public function sender()
      {
          return $this->belongsTo(EntreInf::class, 'sender_id');
      }
        // Relationship to EntreInf (receiver)
    public function receiver()
    {
        return $this->belongsTo(EntreInf::class, 'receiver_id');
    }
}
