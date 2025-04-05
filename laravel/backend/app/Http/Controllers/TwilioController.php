<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\ChatGrant;
use Twilio\Jwt\Grants\VideoGrant;
use Twilio\Jwt\Grants\VoiceGrant;
use Twilio\Rest\Client;
use App\Models\EntreInf;
use App\Models\User;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TwilioController extends Controller
{
    private $twilioAccountSid;
    private $twilioApiKey;
    private $twilioApiSecret;
    private $twilioServiceSid;
    private $twilioAuthToken;

    public function __construct()
    {
        // Load credentials from environment variables - NEVER hardcode these
        $this->twilioAccountSid = env('TWILIO_SID');
        $this->twilioAuthToken = env('TWILIO_AUTH_TOKEN');
        $this->twilioApiKey = env('TWILIO_API_KEY');
        $this->twilioApiSecret = env('TWILIO_API_SECRET');
        $this->twilioServiceSid = env('TWILIO_SERVICE_SID');
    }

    /**
     * Generate a Twilio access token for client-side authentication
     * 
     * @param int $userId User ID to generate token for
     * @return \Illuminate\Http\JsonResponse
     */
    /**
     * Generate a Twilio access token for client-side authentication
     * 
     * @param int $userId User ID to generate token for
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateToken($userId)
    {
        try {
            $user = EntreInf::find($userId);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
    
            $userId = (string) $userId;
    
            // Create an access token
            $token = new AccessToken(
                $this->twilioAccountSid, // TWILIO_SID
                $this->twilioApiKey,     // TWILIO_API_KEY
                $this->twilioApiSecret,  // TWILIO_API_SECRET
                3600, // Token TTL (1 hour)
                $userId // User identity
            );
    
            // Add ChatGrant to the token
            $chatGrant = new ChatGrant();
            if ($this->twilioServiceSid) {
                $chatGrant->setServiceSid($this->twilioServiceSid); // TWILIO_SERVICE_SID
            }
    
            $token->addGrant($chatGrant);
    
            // Generate the JWT token
            $jwt = $token->toJWT();
    
            Log::info("Generated Twilio token for user: $userId");
            // Remove this line - SECURITY RISK!
            // Log::info("Token: $jwt"); 
    
            return response()->json(['token' => $jwt]);
        } catch (\Exception $e) {
            Log::error('Failed to generate Twilio token: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate token: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Add a participant to a Twilio conversation
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addParticipant(Request $request)
    {
        try {
            // Validate request data
            $validator = Validator::make($request->all(), [
                'conversationId' => 'required|string',
                'participantId' => 'required|numeric|exists:users,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            $conversationId = $request->conversationId;
            $participantId = (string) $request->participantId;

            // Initialize the Twilio client
            $twilio = new Client($this->twilioAccountSid, $this->twilioAuthToken);
            
            // Check if the conversation exists
            try {
                $twilio->conversations->v1->conversations($conversationId)->fetch();
            } catch (\Exception $e) {
                return response()->json(['error' => 'Conversation not found'], 404);
            }
            
            // Check if participant is already in the conversation
            $participants = $twilio->conversations->v1->conversations($conversationId)
                ->participants
                ->read();
                
            $exists = false;
            foreach ($participants as $participant) {
                if ($participant->identity === $participantId) {
                    $exists = true;
                    break;
                }
            }
            
            // Only add if not already a participant
            if (!$exists) {
                try {
                    $participant = $twilio->conversations->v1->conversations($conversationId)
                        ->participants
                        ->create([
                            'identity' => $participantId
                        ]);
                        
                    Log::info("Added participant $participantId to conversation $conversationId");
                    
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Participant added successfully',
                        'participantSid' => $participant->sid
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to add participant $participantId: " . $e->getMessage());
                    return response()->json(['error' => 'Failed to add participant: ' . $e->getMessage()], 500);
                }
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Participant already exists in conversation'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to add participant: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Send a message in a conversation
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendMessage(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'sender_id' => 'required|numeric|exists:entre_inf,id', // Use entre_inf table
                'receiver_id' => 'required|numeric|exists:entre_inf,id', // Use entre_inf table
                'message' => 'required|string|max:2000',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }
    
            $senderId = $request->sender_id;
            $receiverId = $request->receiver_id;
            $messageContent = $request->message;
            
            // Get or create a chat session between the users
            $chatSession = ChatSession::where(function($query) use ($senderId, $receiverId) {
                $query->where('user_id', $senderId)
                      ->where('participant_id', $receiverId);
            })->orWhere(function($query) use ($senderId, $receiverId) {
                $query->where('user_id', $receiverId)
                      ->where('participant_id', $senderId);
            })->first();
            
            if (!$chatSession) {
                $conversationSid = $this->createConversation($senderId, $receiverId);
                
                if (!$conversationSid) {
                    return response()->json(['error' => 'Failed to create conversation'], 500);
                }
                
                $chatSession = ChatSession::create([
                    'user_id' => $senderId,
                    'participant_id' => $receiverId,
                    'conversation_sid' => $conversationSid,
                    'status' => 'active'
                ]);
            }
            
            // Store message in your local database
            $chatMessage = ChatMessage::create([
                'chat_session_id' => $chatSession->id,
                'sender_id' => $senderId,
                'receiver_id' => $receiverId,
                'message' => $messageContent,
                'read_at' => null
            ]);
            
            // Send message via Twilio
            try {
                $twilio = new Client($this->twilioAccountSid, $this->twilioAuthToken);
                $message = $twilio->conversations->v1->conversations($chatSession->conversation_sid)
                    ->messages
                    ->create([
                        'author' => (string) $senderId,
                        'body' => $messageContent
                    ]);
                
                // Update local record with Twilio message SID
                $chatMessage->update(['message_sid' => $message->sid]);
                
                Log::info("Message sent in conversation {$chatSession->conversation_sid} by user $senderId");
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Message sent successfully',
                    'data' => $chatMessage
                ]);
            } catch (\Exception $e) {
                Log::error("Failed to send message via Twilio: " . $e->getMessage());
                return response()->json(['error' => 'Failed to send message: ' . $e->getMessage()], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send message: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Create a new Twilio conversation between two users
     * 
     * @param int $user1Id First user ID
     * @param int $user2Id Second user ID
     * @return string|null Conversation SID if successful, null otherwise
     */
    private function createConversation($user1Id, $user2Id)
    {
        try {
            // Initialize Twilio client
            $twilio = new Client($this->twilioAccountSid, $this->twilioAuthToken);
            
            // Create conversation
            $conversation = $twilio->conversations->v1->conversations
                ->create([
                    'friendlyName' => "Conversation between $user1Id and $user2Id",
                ]);
            
            // Add first participant
            $twilio->conversations->v1->conversations($conversation->sid)
                ->participants
                ->create([
                    'identity' => (string) $user1Id
                ]);
            
            // Add second participant
            $twilio->conversations->v1->conversations($conversation->sid)
                ->participants
                ->create([
                    'identity' => (string) $user2Id
                ]);
            
            Log::info("Created conversation {$conversation->sid} between users $user1Id and $user2Id");
            
            return $conversation->sid;
        } catch (\Exception $e) {
            Log::error("Failed to create conversation: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get all conversations for a user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConversations(Request $request)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            // Get all chat sessions involving the user
            $chatSessions = ChatSession::where('user_id', $userId)
                ->orWhere('participant_id', $userId)
                ->with(['user', 'participant'])
                ->get();
            
            $conversations = [];
            
            foreach ($chatSessions as $session) {
                // Determine who the other participant is
                $otherUser = ($session->user_id == $userId) ? $session->participant : $session->user;
                
                // Get the last message
                $lastMessage = ChatMessage::where('chat_session_id', $session->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                // Count unread messages
                $unreadCount = ChatMessage::where('chat_session_id', $session->id)
                    ->where('receiver_id', $userId)
                    ->whereNull('read_at')
                    ->count();
                
                $conversations[] = [
                    'session_id' => $session->id,
                    'conversation_sid' => $session->conversation_sid,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'profile_image' => $otherUser->profile_image ?? null,
                    ],
                    'last_message' => $lastMessage ? [
                        'message' => $lastMessage->message,
                        'sender_id' => $lastMessage->sender_id,
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'unread_count' => $unreadCount,
                    'created_at' => $session->created_at,
                    'updated_at' => $session->updated_at,
                ];
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $conversations
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get conversations: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get messages for a specific conversation
     * 
     * @param Request $request
     * @param int $sessionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMessages(Request $request, $sessionId)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            // Check if the session exists and user is a participant
            $chatSession = ChatSession::where('id', $sessionId)
                ->where(function($query) use ($userId) {
                    $query->where('user_id', $userId)
                          ->orWhere('participant_id', $userId);
                })
                ->first();
            
            if (!$chatSession) {
                return response()->json(['error' => 'Conversation not found or access denied'], 404);
            }
            
            // Get messages with pagination
            $perPage = $request->input('per_page', 15);
            $messages = ChatMessage::where('chat_session_id', $sessionId)
                ->with(['sender', 'receiver'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
            
            // Mark messages as read
            ChatMessage::where('chat_session_id', $sessionId)
                ->where('receiver_id', $userId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
            
            return response()->json([
                'status' => 'success',
                'data' => $messages
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get messages: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Generate a token for video calling
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateVideoToken(Request $request)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            // Create an access token with video grant
            $token = new AccessToken(
                $this->twilioAccountSid,
                $this->twilioApiKey,
                $this->twilioApiSecret,
                3600, // TTL in seconds
                (string) $userId
            );
            
            // Create a Video grant
            $videoGrant = new VideoGrant();
            $videoGrant->setRoom($request->input('room', null));
            
            // Add the grant to the token
            $token->addGrant($videoGrant);
            
            // Return token as JWT
            return response()->json(['token' => $token->toJWT()]);
        } catch (\Exception $e) {
            Log::error('Failed to generate video token: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Delete a message
     * 
     * @param Request $request
     * @param int $messageId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMessage(Request $request, $messageId)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            // Get the message
            $message = ChatMessage::where('id', $messageId)
                ->where('sender_id', $userId) // Only sender can delete their message
                ->first();
            
            if (!$message) {
                return response()->json(['error' => 'Message not found or access denied'], 404);
            }
            
            // Delete from Twilio if message_sid exists
            if ($message->message_sid) {
                try {
                    $twilio = new Client($this->twilioAccountSid, $this->twilioAuthToken);
                    $twilio->conversations->v1->conversations($message->chatSession->conversation_sid)
                        ->messages($message->message_sid)
                        ->delete();
                } catch (\Exception $e) {
                    Log::warning("Failed to delete message from Twilio: " . $e->getMessage());
                    // Continue with local deletion regardless
                }
            }
            
            // Delete from local database
            $message->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Message deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete message: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}