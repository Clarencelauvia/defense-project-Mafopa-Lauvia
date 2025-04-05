<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', // ID of the employer (from EntreInf)
        'participant_id', // ID of the other participant (from EntreInf)

        'status', // Active, Inactive, etc.
    ];

      // Relationship to EntreInf (user)
      public function user()
      {
          return $this->belongsTo(EntreInf::class, 'user_id');
      }
  
      // Relationship to EntreInf (participant)
      public function participant()
      {
          return $this->belongsTo(EntreInf::class, 'participant_id');
      }

       // Relationship to ChatMessage
    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}
