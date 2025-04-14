<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\JobPosting;
use App\Models\User;

class JobPosted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $job;
    
    public function __construct(JobPosting $job)
    {
        $this->job = $job;
    }

    public function broadcastOn(): array
    {
        // Get users who match at least two criteria (excluding skills)
        $matchingUsers = User::where(function($query) {
                $query->where('qualification', $this->job->qualification)
                      ->where('educational_level', $this->job->educational_level);
            })
            ->orWhere(function($query) {
                $query->where('qualification', $this->job->qualification)
                      ->where('address', $this->job->location);
            })
            ->orWhere(function($query) {
                $query->where('educational_level', $this->job->educational_level)
                      ->where('experience_level', $this->job->experience_level);
            })
            ->orWhere(function($query) {
                $query->where('experience_level', $this->job->experience_level)
                      ->where('qualification', $this->job->qualification);
            })
            ->get();

        $channels = [];
        foreach ($matchingUsers as $user) {
            $channels[] = new PrivateChannel('user.' . $user->id);
        }

        // Also broadcast to the public channel if needed
        $channels[] = new Channel('job-posted');

        return $channels;
    }

    public function broadcastAs()
    {
        return 'job.posted';
    }

    public function broadcastWith()
    {
        return [
            'job_id' => $this->job->id,
            'job_title' => $this->job->job_title,
            'company_description' => $this->job->company_description,
            'location' => $this->job->location,
            'salary_range' => $this->job->salary_range,
            'job_description' => $this->job->job_description,
            'experience_level' => $this->job->experience_level,
            'educational_level' => $this->job->educational_level,
            'qualification' => $this->job->qualification
        ];
    }
}