<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $message;
    public $notification;
    public function __construct($data)
    {
        $this->message = $data['message'];
        $this->notification = $data['notification'];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->receiver_id),
        ];
    }
    public function broadcastAs()
    {
        return 'message-sent';
    }
    public function broadcastWith()
{
    return [
        'message' => $this->message,
        'notification' => [
            'user_id' => $this->message->receiver_id,
            'message' => 'You have a new message from ' . $this->message->sender_id,
        ],
    ];
}
}
