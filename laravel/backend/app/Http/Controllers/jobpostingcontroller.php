<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\jobPosting;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\JobPosted;
use App\Mail\JobPostedNotification; 
use Illuminate\Support\Facades\Mail; 
use App\Services\TwilioService;
use App\Models\User;


class jobpostingcontroller extends Controller
{
    public function jobPost(Request $request)
    {
        \Log::info('Job Posting Request Data:', $request->all());
        \Log::info('Received job posting data:', $request->all());
    
        $request->validate([
            'job_title' => 'required|string|max:255',
            'educational_level' => 'required|string|max:255',
            'job_description' => 'required|string',
            'salary_range' => 'required|string|max:255',
            'job_category' => 'required|string|max:255',
            'experience_level' => 'required|string|max:255',
            'company_description' => 'required|string',
            'skill_required' => 'required|string|max:255',
            'job_type' => 'required|string|max:255',
            'job_duration' => 'required|string|max:255',
            'location' => 'required|string|max:255',
        ]);
    
        try {
            // Get the authenticated user
            $user = Auth::user();
    
            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized: User not authenticated.',
                ], 401);
            }
                // Check if the user is authenticated
    if (!Auth::check()) {
        \Log::error('User is not authenticated.');
        return response()->json([
            'message' => 'Unauthorized: User not authenticated.',
        ], 401);
    }
    $user = Auth::user();
    \Log::info('Authenticated User:', ['user' => $user]);

    
            // Create the job posting
            $jobPosting = JobPosting::create([
                'job_title' => $request->job_title,
                'educational_level' => $request->educational_level,
                'job_description' => $request->job_description,
                'salary_range' => $request->salary_range,
                'job_category' => $request->job_category,
                'experience_level' => $request->experience_level,
                'company_description' => $request->company_description,
                'skill_required' => $request->skill_required,
                'job_type' => $request->job_type,
                'job_duration' => $request->job_duration,
                'location' => $request->location,
                'entre_inf_id' => $user->id, // Associate the job posting with the authenticated user
            ]);
    
            \Log::info('Job Posted Successfully:', $jobPosting->toArray());

            \Log::info('Job Posted Successfully:', $jobPosting->toArray());

    // Broadcast the event
    broadcast(new JobPosted($jobPosting))->toOthers();

       // Find employees who match the job criteria (warm matches)
       $warmMatches = User::where('experience_level', $jobPosting->experience_level)
       ->orWhere('educational_level', $jobPosting->educational_level)
       ->orWhere('qualification', $jobPosting->qualification)
       ->get();

   // Send email notifications to matched employees
   foreach ($warmMatches as $employee) {
    try {
        \Log::info('Sending email to employee:', ['email' => $employee->email]);
        Mail::to($employee->email)->send(new JobPostedNotification($jobPosting));
    } catch (\Exception $e) {
        \Log::error('Error sending email to employee:', ['email' => $employee->email, 'error' => $e->getMessage()]);
    }
}

// Send SMS notification
$twilioService = new TwilioService();
$message = "New Job Posted: {$jobPosting->job_title}. Location: {$jobPosting->location}";
$phoneNumber = '+237' . $user->contact_number; // Prepend the country code

try {
    $twilioService->sendSMS($phoneNumber, $message);
} catch (\Exception $e) {
    \Log::error('Twilio SMS Error: ' . $e->getMessage());
    // Continue with job posting even if SMS fails
}

            return response()->json([
                'message' => 'Job Posted Successfully',
                'job' => $jobPosting,
                'jobId' => $jobPosting->id,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error Posting Job:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(){
        $jobs = JobPosting::all();  // Fetch all jobs from the database
        return response()->json($jobs); // Ensure this returns an array
    }

     // Fetch a single job by ID
     public function show($id)
     {
         $job = JobPosting::find($id);
 
         if (!$job) {
             return response()->json([
                 'message' => 'Job not found',
             ], 404);
         }
 
         return response()->json($job);
     }

     // In JobPosting.php
public function entreInf()
{
    return $this->belongsTo(EntreInfController::class, 'entre_inf_id');
}




}
