<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class jobsOffer extends Model
{
    use HasFactory;
    protected $fillable = [
        'job_title',
        'educational_level',
        'job_description',
        'salary_range',
        'job_category',
        'experience_level',
        'company_description',
        'skill_required',
        'job_type',
        'job_duration',
        'location'
      
        
    ];
}
