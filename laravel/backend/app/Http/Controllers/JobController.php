<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use Illuminate\Http\Request;

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
    // Get the authenticated user
    $user = auth()->user();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    // Detach the job from the user's saved jobs
    $user->savedJobs()->detach($jobId);

    // Return a success response
    return response()->json([
        'message' => 'Job unsaved successfully.',
    ], 200);
}
}
