<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployerLoginDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'entre_inf_id', 'login_date',
    ];

    public function entreInf()
    {
        return $this->belongsTo(EntreInf::class, 'entre_inf_id');
    }
    // In app/Models/Employer.php
public function loginDates()
{
    $user = auth()->user();
    $loginDates = $user->login_dates; // This will be an array of dates
    return $this->hasMany(EmployerLoginDate::class);
}
}
