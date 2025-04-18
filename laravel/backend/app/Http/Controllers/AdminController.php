<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use Illuminate\Support\Facades\Password;
use App\Models\User;
use App\Models\EntreInf;
use App\Models\JobPosting;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminPasswordReset;

class AdminController extends Controller
{
    // Predefined admin email - single source of truth
    protected $adminEmail = 'lauviamafopa697@gmail.com';
    protected $adminPassword = 'lauviamafopa@123'; // Change this to your desired default password

    public function __construct()
    {
        // Ensure admin account exists when controller is instantiated
        $this->ensureAdminExists();
    }
    protected function ensureAdminExists()
    {
        $admin = Admin::where('email', $this->adminEmail)->first();
        
        if (!$admin) {
            Admin::create([
                'name' => 'System Administrator',
                'email' => $this->adminEmail,
                'password' => Hash::make($this->adminPassword),
                'email_verified_at' => now(),
            ]);
        }
    }
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
    
            $admin = Admin::where('email', $request->email)->first();
    
            if (!$admin) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }
    
            if (!Hash::check($request->password, $admin->password)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }
    
            // Correct token creation with only required arguments
            $token = $admin->createToken('admin_token')->plainTextToken;
    
            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'admin' => $admin->only(['name', 'email'])
            ]);
    
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }
  public function getMetrics(Request $request)
{
    if (!$request->user() instanceof Admin) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    return response()->json([
        'activeUsers' => User::count() + EntreInf::count(),
        'userGrowth' => 12.5,
        'activeJobs' => JobPosting::where('status', 'active')->count(),
        'jobGrowth' => 8.2,
        'revenue' => 45789,
        'revenueChange' => -2.4,
        'successRate' => 92,
        'successRateChange' => 3.8
    ]);
}

public function getUsers(Request $request)
{
    if (!$request->user() instanceof Admin) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $jobSeekers = User::select('id', 'first_name', 'last_name', 'email', 'created_at as joinDate')
        ->get()
        ->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'type' => 'jobseeker',
                'status' => 'active',
                'joinDate' => $user->joinDate
            ];
        });

    $employers = EntreInf::select('id', 'first_name', 'last_name', 'email', 'created_at as joinDate')
        ->get()
        ->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'type' => 'employer',
                'status' => 'active',
                'joinDate' => $user->joinDate
            ];
        });

    return response()->json($jobSeekers->merge($employers)->sortByDesc('joinDate')->values());
}

// Add these methods to your AdminController

public function getUsersWithActivity(Request $request)
{
    if (!$request->user() instanceof Admin) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $inactiveThreshold = now()->subDays(15);

    $jobSeekers = User::select('id', 'first_name', 'last_name', 'email', 'created_at as joinDate', 'last_login_at')
        ->get()
        ->map(function($user) use ($inactiveThreshold) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'type' => 'jobseeker',
                'status' => $user->banned_until ? 
                    ($user->banned_until > now() ? 'suspended' : 'active') : 
                    ($user->last_login_at && $user->last_login_at->lt($inactiveThreshold) ? 'inactive' : 'active'),
                'joinDate' => $user->joinDate,
                'lastLogin' => $user->last_login_at,
                'bannedUntil' => $user->banned_until
            ];
        });

    $employers = EntreInf::select('id', 'first_name', 'last_name', 'email', 'created_at as joinDate', 'last_login_at')
        ->get()
        ->map(function($user) use ($inactiveThreshold) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'type' => 'employer',
                'status' => $user->banned_until ? 
                    ($user->banned_until > now() ? 'suspended' : 'active') : 
                    ($user->last_login_at && $user->last_login_at->lt($inactiveThreshold) ? 'inactive' : 'active'),
                'joinDate' => $user->joinDate,
                'lastLogin' => $user->last_login_at,
                'bannedUntil' => $user->banned_until
            ];
        });

    return response()->json($jobSeekers->merge($employers)->sortByDesc('joinDate')->values());
}

public function banUser(Request $request, $userId, $type)
{
    if (!$request->user() instanceof Admin) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $request->validate([
        'days' => 'required|integer|min:1'
    ]);

    $days = $request->days;
    $banUntil = now()->addDays($days);

    if ($type === 'jobseeker') {
        $user = User::findOrFail($userId);
    } else {
        $user = EntreInf::findOrFail($userId);
    }

    $user->banned_until = $banUntil;
    $user->save();

    return response()->json([
        'message' => 'User banned successfully until ' . $banUntil->toDateTimeString(),
        'user' => [
            'id' => $user->id,
            'name' => $user->first_name . ' ' . $user->last_name,
            'banned_until' => $banUntil
        ]
    ]);
}

public function unbanUser(Request $request, $userId, $type)
{
    if (!$request->user() instanceof Admin) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if ($type === 'jobseeker') {
        $user = User::findOrFail($userId);
    } else {
        $user = EntreInf::findOrFail($userId);
    }

    $user->banned_until = null;
    $user->save();

    return response()->json([
        'message' => 'User unbanned successfully',
        'user' => [
            'id' => $user->id,
            'name' => $user->first_name . ' ' . $user->last_name
        ]
    ]);
}

public function deleteUser(Request $request, $userId, $type)
{
    if (!$request->user() instanceof Admin) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if ($type === 'jobseeker') {
        $user = User::findOrFail($userId);
    } else {
        $user = EntreInf::findOrFail($userId);
    }

    // Delete related data first if needed
    if ($type === 'jobseeker') {
        $user->applications()->delete();
    } else {
        $user->jobPostings()->delete();
    }

    $user->delete();

    return response()->json([
        'message' => 'User deleted successfully',
        'user' => [
            'id' => $userId,
            'type' => $type
        ]
    ]);
}

public function deleteJob(Request $request, $jobId)
{
    if (!$request->user() instanceof Admin) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $job = JobPosting::findOrFail($jobId);
    $employer = $job->entreInf;
    
    // Send email notification to employer
    Mail::to($employer->email)->send(new JobDeletedNotification($job));
    
    $job->delete();

    return response()->json([
        'message' => 'Job deleted successfully',
        'job' => [
            'id' => $jobId,
            'title' => $job->job_title
        ]
    ]);
}

    public function getActivities(Request $request)
    {
        if (!$request->user() instanceof Admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            [
                'id' => 1,
                'type' => 'user',
                'message' => 'New user registered',
                'time' => now()->subMinutes(5)->toDateTimeString()
            ],
            [
                'id' => 2,
                'type' => 'job',
                'message' => 'New job posted',
                'time' => now()->subMinutes(15)->toDateTimeString()
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
    
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        // Only allow password reset for the predefined admin email
        if ($request->email !== $this->adminEmail) {
            return response()->json(['message' => 'Invalid admin email.'], 404);
        }

        $admin = Admin::where('email', $this->adminEmail)->first();
        if (!$admin) {
            // If admin doesn't exist (somehow was deleted), recreate it
            $admin = Admin::create([
                'name' => 'System Administrator',
                'email' => $this->adminEmail,
                'password' => Hash::make('Admin@' . rand(10000, 99999)),
                'email_verified_at' => now(),
            ]);
        }

        $tempPassword = 'Admin!' . rand(10000, 99999);
        $admin->password = Hash::make($tempPassword);
        $admin->save();

        Mail::to($admin->email)->send(new AdminPasswordReset($tempPassword));

        return response()->json([
            'message' => 'A temporary password has been sent to the admin email.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Only allow password reset for the predefined admin email
        if ($request->email !== $this->adminEmail) {
            return response()->json(['message' => 'Invalid admin email.'], 404);
        }

        $admin = Admin::where('email', $this->adminEmail)->first();
        if (!$admin) {
            return response()->json(['message' => 'Admin account not found.'], 404);
        }

        $admin->password = Hash::make($request->password);
        $admin->save();

        return response()->json(['message' => 'Password reset successfully.']);
    }

   
}