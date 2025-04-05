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

class JobPosted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *  * @param  \App\Models\JobPosting  $job
     * @return void
     */

     
    public $job;
    public function __construct(JobPosting $job)
    {
        $this->job = $job;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('job-posted'), // Return an array of channels
        ];
    }

    public function broadcastAs()
    {
        return 'job.posted';
    }

    public function broadcastWith()
    {
        return [
            'job' => [
                'id' => $this->job->id,
                'job_title' => $this->job->title,
                // Add other job fields you want to include
            ]
        ];
    }
}
