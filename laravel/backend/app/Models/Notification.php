<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    protected $table = 'notificationes';

    
    protected $fillable = [
        'user_id',
        'message',
        'read',
    ];
}
