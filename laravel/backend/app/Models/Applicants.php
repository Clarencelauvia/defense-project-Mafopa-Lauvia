<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;  


class Applicants extends Model
{
    use HasFactory;
    use Notifiable;


    protected $table = '_applicants';

    protected $fillable = [
        'job_id', 
        'first_name',
         'last_name',
          'email', 
          'gender',
          'address',
          'code',
          'image',
          'contact_number',
         'qualification', 
         'experienceLevel',
          'educational_level', 
          'application_date', 
          'status',
    ];

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function job()
{
    return $this->belongsTo(JobPosting::class, 'job_id');
}

    
}
