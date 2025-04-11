<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Notifications\DefaultPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'image_url',
        'code',
        'contact_number',
        'gender',
        'password',
        'qualification',
        'address',
        'experience_level',
        'educational_level',
        'login_dates',

       
        
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
        'login_dates' => 'array', // Automatically cast JSON to an array
    ];
    

    public function sendPasswordResetNotification($defaultPassword)
    {
        $this->notify(new DefaultPasswordNotification($defaultPassword));
    }
    // In your User model
public function loginDates() {
    $user = auth()->user();
$loginDates = $user->login_dates; // This will be an array of dates
    return $this->hasMany(LoginDate::class);
}
public function savedJobs()
{
    return $this->belongsToMany(JobPosting::class, 'user_job_saving', 'user_id', 'job_id')
        ->withTimestamps(); // Optional: if you want to track when the job was saved
}

}
