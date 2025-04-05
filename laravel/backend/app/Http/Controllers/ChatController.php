<?php

namespace App\Http\Controllers;
use App\Http\Controllers\EntreInfController;

use Illuminate\Http\Request;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\EntreInf;
use Illuminate\Support\Facades\Auth;


class ChatController extends Controller
{
    public function getOrCreateSession(Request $request)
    {
        try {
            \Log::info('Creating chat session', $request->all());
            
            $validatedData = $request->validate([
                'user_id' => 'required|exists:entre_inf,id',
                'participant_id' => 'required|exists:entre_inf,id'
            ]);
    
            $session = ChatSession::where(function($query) use ($validatedData) {
                $query->where('user_id', $validatedData['user_id'])
                      ->where('participant_id', $validatedData['participant_id']);
            })->orWhere(function($query) use ($validatedData) {
                $query->where('user_id', $validatedData['participant_id'])
                      ->where('participant_id', $validatedData['user_id']);
            })->first();
    
            if (!$session) {
                $session = ChatSession::create([
                    'user_id' => $validatedData['user_id'],
                    'participant_id' => $validatedData['participant_id'],
                    'status' => 'active'
                    // No conversation_sid needed
                ]);
                \Log::info('Created new chat session', ['id' => $session->id]);
            }
    
            return response()->json($session);
            
        } catch (\Exception $e) {
            \Log::error('Chat session error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // public function sendMessage(Request $request)
    // {
    //     try {
    //         $validatedData = $request->validate([
    //             'sender_id' => 'required|exists:entre_inf,id',
    //             'receiver_id' => 'required|exists:entre_inf,id',
    //             'message' => 'required|string|max:2000',
    //             'chat_session_id' => 'required|exists:chat_sessions,id'
    //         ]);

    //         $message = ChatMessage::create([
    //             'chat_session_id' => $validatedData['chat_session_id'],
    //             'sender_id' => $validatedData['sender_id'],
    //             'receiver_id' => $validatedData['receiver_id'],
    //             'message' => $validatedData['message']
    //         ]);

    //         \Log::info('Message sent', ['id' => $message->id]);
    //         return response()->json(['status' => 'success', 'data' => $message]);

    //     } catch (\Exception $e) {
    //         \Log::error('Send message error: ' . $e->getMessage());
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }

    public function getMessages($sessionId)
    {
        try {
            $userId = Auth::id();
            
            $messages = ChatMessage::where('chat_session_id', $sessionId)
                ->where(function($query) use ($userId) {
                    $query->where(function($q) use ($userId) {
                        // Messages user sent that aren't deleted for them
                        $q->where('sender_id', $userId)
                          ->where('deleted_by_sender', false)
                          ->where('deleted_for_all', false);
                    })->orWhere(function($q) use ($userId) {
                        // Messages user received that aren't deleted for them
                        $q->where('receiver_id', $userId)
                          ->where('deleted_by_receiver', false)
                          ->where('deleted_for_all', false);
                    });
                })
                ->orderBy('created_at', 'asc')
                ->paginate(15);
    
            return response()->json([
                'status' => 'success',
                'data' => $messages
            ]);
        } catch (\Exception $e) {
            \Log::error('Get messages error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function markMessagesAsRead(Request $request)
    {
        try {
            \Log::info('Mark Messages as Read - Request Data', $request->all());
            
            $validatedData = $request->validate([
                'message_ids' => 'required|array|min:1',
                'message_ids.*' => 'required|integer|exists:chat_messages_new,id', // Changed to chat_messages_new
                'chat_session_id' => 'required|exists:chat_sessions,id'
            ]);
    
            $userId = Auth::id();
            
            $updated = ChatMessage::whereIn('id', $validatedData['message_ids'])
                ->where('chat_session_id', $validatedData['chat_session_id'])
                ->where('receiver_id', $userId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
    
            return response()->json([
                'status' => 'success', 
                'count' => $updated,
                'message_ids' => $validatedData['message_ids']
            ]);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', $e->errors());
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Mark as read error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function sendMessage(Request $request, $sessionId)
    {
        try {
            \Log::info('Incoming send message request', [
                'sessionId' => $sessionId,
                'requestData' => $request->all()
            ]);
    
            $validatedData = $request->validate([
                'sender_id' => 'required|exists:entre_inf,id',
                'receiver_id' => 'required|exists:entre_inf,id',
                'message' => 'required|string|max:2000'
            ]);
    
            // Verify the chat session exists and the users are part of it
            $session = ChatSession::findOrFail($sessionId);
    
            // Ensure the sender and receiver are part of this chat session
            if (
                !($session->user_id == $validatedData['sender_id'] && 
                  $session->participant_id == $validatedData['receiver_id']) &&
                !($session->user_id == $validatedData['receiver_id'] && 
                  $session->participant_id == $validatedData['sender_id'])
            ) {
                throw new \Exception('Invalid sender or receiver for this chat session');
            }
    
            $message = ChatMessage::create([
                'chat_session_id' => $sessionId,
                'sender_id' => $validatedData['sender_id'],
                'receiver_id' => $validatedData['receiver_id'],
                'message' => $validatedData['message']
            ]);
    
            \Log::info('Message sent successfully', ['id' => $message->id]);
            return response()->json(['status' => 'success', 'data' => $message]);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in sendMessage', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            return response()->json(['error' => $e->errors()], 422);
    
        } catch (\Exception $e) {
            \Log::error('Send message error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'sessionId' => $sessionId,
                'requestData' => $request->all()
            ]);
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function deleteMessage(Request $request, $messageId)
    {
        try {
            $userId = Auth::id();
            $message = ChatMessage::findOrFail($messageId);
    
            $isSender = $message->sender_id == $userId;
            $isReceiver = $message->receiver_id == $userId;
    
            if (!$isSender && !$isReceiver) {
                return response()->json(['error' => 'Unauthorized to delete this message'], 403);
            }
    
            if ($isSender) {
                // For sent messages - can delete for everyone or just for self
                $deleteForEveryone = $request->input('for_everyone', false);
                
                if ($deleteForEveryone) {
                    // Delete for everyone (mark both flags)
                    $message->update([
                        'deleted_by_sender' => true,
                        'deleted_by_receiver' => true,
                        'message' => '[Message deleted]'
                    ]);
                } else {
                    // Delete just for sender
                    $message->update(['deleted_by_sender' => true]);
                }
            } else {
                // For received messages - can only delete for self
                $message->update(['deleted_by_receiver' => true]);
            }
    
            // Check if message should be fully deleted (both parties deleted it)
            if ($message->deleted_by_sender && $message->deleted_by_receiver) {
                $message->delete();
            }
    
            return response()->json([
                'status' => 'success',
                'message' => 'Message deleted successfully'
            ]);
    
        } catch (\Exception $e) {
            \Log::error('Delete message error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    private function checkForFullDeletion($message)
    {
        // Delete completely if:
        // 1. Both parties have deleted it, OR
        // 2. It was deleted for everyone
        $shouldDelete = ($message->deleted_for_sender && $message->deleted_for_receiver) || 
                        $message->deleted_for_all;
    
        if ($shouldDelete) {
            $message->delete();
        }
    }

    // In your Laravel controller (e.g., ChatController.php)
    public function getUnreadCount($userId)
    {
        try {
            $count = ChatMessage::where('receiver_id', $userId)
                ->whereNull('read_at')
                ->count();
    
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            \Log::error('Get unread count error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getRecentMessages($userId)
{
    try {
        $messages = ChatMessage::where('receiver_id', $userId)
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        return response()->json($messages);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

// In ChatController.php
public function getContactsWithUnreadCounts(Request $request)
{
    try {
        $userId = Auth::id();
        
        // Get all unique contacts the user has messaged with
        $contacts = ChatMessage::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->get()
            ->map(function ($message) use ($userId) {
                // Determine if the other person is sender or receiver
                return $message->sender_id === $userId 
                    ? $message->receiver 
                    : $message->sender;
            })
            ->unique('id')
            ->map(function ($contact) use ($userId) {
                // Get unread count for each contact
                $unreadCount = ChatMessage::where('sender_id', $contact->id)
                    ->where('receiver_id', $userId)
                    ->whereNull('read_at')
                    ->count();
                    
                return [
                    'id' => $contact->id,
                    'first_name' => $contact->first_name,
                    'last_name' => $contact->last_name,
                    'profile_image' => $contact->image_url,
                    'unread_count' => $unreadCount,
                    'type' => $contact instanceof EntreInf ? 'employer' : 
                             ($contact instanceof Admin ? 'admin' : 'jobseeker'),
                    'organisation_name' => $contact->organisation_name ?? null,
                    'domain' => $contact->domain ?? null,
                    'address' => $contact->address ?? null
                ];
            })
            ->values();
            
        return response()->json($contacts);
    } catch (\Exception $e) {
        \Log::error('Failed to fetch contacts: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function getContacts($userId)
{
    try {
        // Get all unique contacts for this user (both senders and receivers)
        $contacts = ChatMessage::selectRaw('
            CASE 
                WHEN sender_id = ? THEN receiver_id 
                ELSE sender_id 
            END as contact_id,
            MAX(created_at) as last_message_time,
            COUNT(CASE WHEN receiver_id = ? AND read_at IS NULL THEN 1 END) as unread_count
        ', [$userId, $userId])
            ->where(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->where(function($query) {
                $query->where('deleted_by_sender', false)
                    ->orWhere('deleted_by_receiver', false);
            })
            ->groupBy('contact_id')
            ->orderBy('last_message_time', 'desc')
            ->get();

        // Get user details for each contact
        $contactDetails = [];
        foreach ($contacts as $contact) {
            $user = EntreInf::find($contact->contact_id);
            if ($user) {
                $contactDetails[] = [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'profile_image' => $user->image_url,
                    'unread_count' => $contact->unread_count,
                    'type' => 'employer',
                    'organisation_name' => $user->organisation_name,
                    'domain' => $user->domain,
                    'address' => $user->address
                ];
            }
        }

        return response()->json($contactDetails);
    } catch (\Exception $e) {
        \Log::error('Get contacts error: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}