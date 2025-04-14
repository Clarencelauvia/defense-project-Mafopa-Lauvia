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
use Illuminate\Support\Facades\Mail;
use App\Mail\ApplicantStatusNotification; // Add this import

class ApplicantStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $applicant;
    public $newStatus;

    public function __construct(Applicants $applicant, $newStatus)
    {
        $this->applicant = $applicant;
        $this->newStatus = $newStatus;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('private-applicant.' . $this->applicant->user_id);
    }
    
    public function broadcastWith()
    {
        $applicant = $this->applicant;
        $job = $applicant->job;
        $employer = $job->entreInf ?? (object)['organisation_name' => 'Unknown Employer'];
        
        $data = [
            'applicant' => $applicant,
            'job' => $job ?? (object)['job_title' => 'Unknown Job'],
            'employer' => $employer,
            'status' => $this->newStatus
        ];
    
        try {
            Mail::to($applicant->email)->send(new ApplicantStatusNotification($data));
        } catch (\Exception $e) {
            \Log::error('Failed to send status email', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    
        return [
            'applicant_id' => $applicant->id,
            'status' => $this->newStatus,
            'job_id' => $applicant->job_id,
            'message' => 'Your application status has been updated to: ' . ucfirst($this->newStatus),
            'job_title' => $job->job_title ?? 'Unknown Job',
        ];
    }
}