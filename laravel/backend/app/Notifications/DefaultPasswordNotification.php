<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DefaultPasswordNotification extends Notification
{
    use Queueable;
    protected $defaultPassword;

    /**
     * Create a new notification instance.
     */
    public function __construct($defaultPassword)
    {
        $this->defaultPassword = $defaultPassword;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
        ->subject('Your New Default Password')
        ->line('Your password has been reset. Please use the following default password to log in:')
        ->line('**' . $this->defaultPassword . '**')
        ->line('You can change your password after logging in.')
        ->action('Login', url('/employee_login'));
        
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
