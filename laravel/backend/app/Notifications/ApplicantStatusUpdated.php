<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Applicants;

class ApplicantStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    protected $applicant;
    protected $status;
    protected $job;
    protected $employer;

    public function __construct(Applicants $applicant, $status)
    {
        $this->applicant = $applicant;
        $this->status = $status;
        $this->job = $applicant->job;
        $this->employer = $applicant->job->entreInf;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $mail = (new MailMessage)
            ->subject('Application Status Update')
            ->greeting('Hello ' . $this->applicant->first_name . ',')
            ->line('Your application for the position of ' . $this->job->job_title . ' at ' . $this->employer->organisation_name . ' has been updated:');
            
        if ($this->status === 'accepted') {
            $mail->line('Congratulations! Your application has been accepted.')
                ->action('View Details', url('/applications/'.$this->applicant->id))
                ->line('The employer may contact you soon for next steps.');
        } else if ($this->status === 'denied') {
            $mail->line('We regret to inform you that your application has been declined.')
                ->line('Do not be discouraged, we encourage you to apply for other opportunities that may suit your skills and experience.');
        } else {
            $mail->line('Your application status is now: ' . ucfirst($this->status));
        }
        
        return $mail->line('Thank you for using our platform!');
    }

    public function toArray($notifiable)
    {
        return [
            'applicant_id' => $this->applicant->id,
            'status' => $this->status,
            'job_title' => $this->job->job_title,
            'employer' => $this->employer->organisation_name
        ];
    }
}