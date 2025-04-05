<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use App\Notifications\DefaultePasswordNotification;

class EntreInf extends Authenticable
{
    use HasApiTokens, HasFactory, Notifiable;


      /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $table = 'entre_inf';
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'image_url',
        'code',
        'contact_number',
        'gender',
        'password',
        'organisation_name',
        'domain',
        'address'
    ];

        /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];


        /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    public function sendPasswordResetNotification($defaultePassword)
    {
        $this->notify(new DefaultePasswordNotification($defaultePassword));
    }

    
    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function loginDates()
    {
        return $this->hasMany(EmployerLoginDate::class);
    }
    // In your EntreInf model:
public function chatSessions()
{
    return $this->hasMany(ChatSession::class, 'user_id', 'id');
    // This means: use 'user_id' in chat_sessions table to match 'id' in entre_inf table
}

public function sentMessages()
{
    return $this->hasMany(ChatMessage::class, 'sender_id');
}

public function receivedMessages()
{
    return $this->hasMany(ChatMessage::class, 'receiver_id');
}
}
