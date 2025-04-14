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
        // // Check if both tables exist
        // if (Schema::hasTable('notificationes') && Schema::hasTable('notifications')) {
        //     // Copy data from notificationes to notifications
        //     DB::statement('INSERT INTO notifications (type, message, job_id, user_id, read, created_at, updated_at) 
        //                   SELECT type, message, job_id, user_id, read, created_at, updated_at 
        //                   FROM notificationes 
        //                   WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE notifications.id = notificationes.id)');
            
        //     // Drop the old table after data is copied
        //     Schema::dropIfExists('notificationes');
        // }
        // elseif (Schema::hasTable('notificationes')) {
        //     // Only notificationes exists - rename it
        //     Schema::rename('notificationes', 'notifications');
        // }
    }
    
    public function down()
    {
        // For rollback safety, we'll just recreate notificationes
        // if (!Schema::hasTable('notificationes')) {
        //     Schema::create('notificationes', function (Blueprint $table) {
        //         $table->id();
        //         $table->string('type');
        //         $table->string('message');
        //         $table->unsignedBigInteger('job_id')->nullable();
        //         $table->unsignedBigInteger('user_id')->nullable();
        //         $table->boolean('read')->default(false);
        //         $table->timestamps();
        //     });
        // }
    }
};
