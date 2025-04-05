<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPosting extends Model
{
    use HasFactory;
    protected $table = 'job_posting';
    protected $fillable = [
        'entre_inf_id',
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
        'location',
       

    ];

    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'user_job_saving', 'job_id', 'user_id')
            ->withTimestamps(); // Optional: if you want to track when the job was saved
    }

    public function entreInf()
    {
        return $this->belongsTo(EntreInf::class, 'entre_inf_id');
    }

    public function applicants()
    {
        return $this->hasMany(Applicants::class);
    }

    
}
