<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Alert;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $alerts = Alert::where('user_id', $user->id)
            ->orWhere('employer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $unreadCount = Alert::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('employer_id', $user->id);
            })
            ->where('is_read', false)
            ->count();
            
        return response()->json([
            'alerts' => $alerts,
            'unread_count' => $unreadCount
        ]);
    }
    
    public function markAsRead(Request $request, $id)
    {
        $alert = Alert::findOrFail($id);
        $alert->is_read = true;
        $alert->save();

        return response()->json(['message' => 'Alert marked as read']);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = Alert::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('employer_id', $user->id);
            })
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}