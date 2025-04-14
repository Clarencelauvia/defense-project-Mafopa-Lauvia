<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificatione extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'message',
        'job_id',
        'user_id',
        'employer_id',
        'read'
    ];

    // Add relationships if needed
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function employer()
    {
        return $this->belongsTo(EntreInf::class, 'employer_id');
    }
}