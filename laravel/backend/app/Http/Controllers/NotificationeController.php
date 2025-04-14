<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notificatione; // Add this import

class NotificationeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Change NotificationeController to Notificatione model
        $notifications = NotificationeController::where('user_id', $user->id)
        ->orWhere('employer_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->take(10)
        ->get();


        $unreadCount = Notificatione::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('employer_id', $user->id);
            })
            ->where('read', false)
            ->count();
            
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }
    
    public function markAsRead(Request $request, $id)
    {
        // Change NotificationeController to Notificatione model
        $notification = Notificatione::findOrFail($id);
        $notification->read = true;
        $notification->save();

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        // Change NotificationeController to Notificatione model
        $count = Notificatione::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('employer_id', $user->id);
            })
            ->where('read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}