<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use Illuminate\Http\Request;
use App\Models\Applicants;

class JobController extends Controller
{
    public function saveJob($jobId)
{
    \Log::info('Saving job for user:', ['user_id' => auth()->id(), 'job_id' => $jobId]);

    $user = auth()->user();

    if (!$user) {
        \Log::error('Unauthorized access to save job');
        return response()->json(['error' => 'User not authenticated'], 401);
    }

    try {
        // Check if the job exists
        $job = JobPosting::find($jobId);

        if (!$job) {
            \Log::error('Job not found:', ['job_id' => $jobId]);
            return response()->json(['error' => 'Job not found'], 404);
        }

        // Attach the job to the user's saved jobs
        $user->savedJobs()->syncWithoutDetaching([$jobId]);

        \Log::info('Job saved successfully:', ['user_id' => $user->id, 'job_id' => $jobId]);
        return response()->json(['message' => 'Job saved successfully']);
    } catch (\Exception $e) {
        \Log::error('Error saving job:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        return response()->json(['message' => 'Internal Server Error'], 500);
    }
}
    
public function getSavedJobs(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    // Fetch the saved jobs for the authenticated user
    $savedJobs = $user->savedJobs()->get();

    return response()->json($savedJobs);
}

public function unsave($jobId)
{
    \Log::info('Unsaving job for user:', ['user_id' => auth()->id(), 'job_id' => $jobId]);

    $user = auth()->user();

    if (!$user) {
        \Log::error('Unauthorized access to unsave job');
        return response()->json(['error' => 'User not authenticated'], 401);
    }

    try {
        // Check if the job exists
        $job = JobPosting::find($jobId);

        if (!$job) {
            \Log::error('Job not found:', ['job_id' => $jobId]);
            return response()->json(['error' => 'Job not found'], 404);
        }

        // Detach the job from the user's saved jobs
        $detached = $user->savedJobs()->detach($jobId);

        if ($detached === 0) {
            return response()->json(['message' => 'Job was not saved'], 400);
        }

        \Log::info('Job unsaved successfully:', ['user_id' => $user->id, 'job_id' => $jobId]);
        return response()->json(['message' => 'Job unsaved successfully']);
    } catch (\Exception $e) {
        \Log::error('Error unsaving job:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        return response()->json(['message' => 'Internal Server Error'], 500);
    }
}
public function getRecommendedJobs(Request $request)
{
    $user = $request->user();
    
    // Get jobs that match the user's profile
    $recommendedJobs = JobPosting::where('educational_level', $user->educational_level)
        ->orWhere('experience_level', $user->experience_level)
        ->orWhere('qualification', 'LIKE', '%' . $user->qualification . '%')
        ->get();

    return response()->json($recommendedJobs);
}

// Add this method to JobController.php
public function getApplicationStatus(Request $request, $jobId)
{
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Query the Applicants model instead of AutheController
        $application = Applicants::where('job_id', $jobId)
            ->where('email', $user->email)
            ->first();

        if (!$application) {
            return response()->json(['status' => 'not_applied']);
        }

        return response()->json(['status' => $application->status]);
    } catch (\Exception $e) {
        \Log::error('Error fetching application status:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        return response()->json(['error' => 'Internal Server Error'], 500);
    }
}
}
