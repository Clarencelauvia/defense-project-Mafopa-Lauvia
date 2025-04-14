<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        if (Schema::hasTable('notificationes') && Schema::hasTable('notifications')) {
            $notifications = DB::table('notificationes')
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                          ->from('notifications')
                          ->whereColumn('notifications.id', 'notificationes.id');
                })
                ->get();
            
            foreach ($notifications as $notification) {
                DB::table('notifications')->insert([
                    'type' => $notification->type,
                    'message' => $notification->message,
                    'job_id' => $notification->job_id,
                    'user_id' => $notification->user_id,
                    'read' => $notification->read,
                    'created_at' => $notification->created_at,
                    'updated_at' => $notification->updated_at
                ]);
            }
            
            Schema::dropIfExists('notificationes');
        }
        elseif (Schema::hasTable('notificationes')) {
            Schema::rename('notificationes', 'notifications');
        }
    }
};
