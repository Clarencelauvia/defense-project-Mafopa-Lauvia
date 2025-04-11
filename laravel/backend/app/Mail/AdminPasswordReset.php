<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminPasswordReset extends Mailable
{
    use Queueable, SerializesModels;

    public $temporaryPassword;

    public function __construct($temporaryPassword)
    {
        $this->temporaryPassword = $temporaryPassword;
    }

    public function build()
    {
        return $this->subject('Your Admin Password Has Been Reset')
                    ->view('emails.admin_password_reset')
                    ->with([
                        'password' => $this->temporaryPassword
                    ]);
    }
}