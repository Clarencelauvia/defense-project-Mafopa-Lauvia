<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginDate extends Model
{
    use HasFactory;
    // In your LoginDate model
protected $fillable = ['user_id', 'login_date'];

public function loginDates() {
    $user = auth()->user();
$loginDates = $user->login_dates; // This will be an array of dates
    return $this->hasMany(LoginDate::class);
}

public function user()
{
    return $this->belongsTo(User::class);
}
}
