<?php

namespace App\Events;

use App\Models\Applicants;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewApplicationEvent implements ShouldBroadcast
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
            'job_id' => $this->applicant->job_id,
            'first_name' => $this->applicant->first_name,
            'last_name' => $this->applicant->last_name,
            'created_at' => $this->applicant->created_at->toDateTimeString(),
        ];
    }
}