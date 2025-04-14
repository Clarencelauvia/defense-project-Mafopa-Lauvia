<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Applicants;

class ApplyToJob implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $applicant;

    public function __construct(Applicants $applicant)
    {
        $this->applicant = $applicant;
    }

    public function broadcastOn()
    {
        return new Channel('applications');
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->applicant->id,
            'first_name' => $this->applicant->first_name,
            'last_name' => $this->applicant->last_name,
            'job_id' => $this->applicant->job_id,
            'message' => $this->applicant->first_name . ' ' . $this->applicant->last_name . 
                         ' applied to your job posting'
        ];
    }
}