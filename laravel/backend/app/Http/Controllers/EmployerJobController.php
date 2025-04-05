<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobPosting;
use Illuminate\Support\Facades\Auth;

class EmployerJobController extends Controller
{
    public function manageJobs(Request $request)
    {
        // Get the authenticated employer
        $employer = $request->user();

        // Fetch all jobs posted by this employer
        $jobs = JobPosting::where('entre_inf_id', $employer->id)->get();

        return response()->json($jobs);
    }

    // In app/Http/Controllers/EmployerJobController.php
public function updateJob(Request $request, $id)
{
    $job = JobPosting::findOrFail($id);

    // Validate the request data
    $request->validate([
        'job_title' => 'required|string',
        'job_description' => 'required|string',
        'salary_range' => 'required|string',
        'job_type' => 'required|string',
        'location' => 'required|string',
    ]);

    // Update the job
    $job->update($request->all());

    return response()->json(['message' => 'Job updated successfully']);
}

public function deleteJob($id)
{
    $job = JobPosting::findOrFail($id);
    $job->delete();

    return response()->json(['message' => 'Job deleted successfully']);
}
// In app/Http/Controllers/EmployerJobController.php
public function getJob($jobId)
{
    // Fetch the job by ID
    $job = JobPosting::find($jobId);

    if (!$job) {
        return response()->json(['message' => 'Job not found'], 404);
    }

    // Return the job data
    return response()->json($job);
}
}
