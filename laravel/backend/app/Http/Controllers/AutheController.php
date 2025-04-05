<?php

namespace App\Http\Controllers;



use App\Models\JobPosting;
use Illuminate\Http\Request;
use App\Models\User;


use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Applicants;
use App\Events\NewApplicationEvent;
use Illuminate\Support\Facades\Log;




class AutheController extends Controller
{
   

    public function register(Request $request) {
        \Log::info('Registration request data:', $request->all());
    
        $request->validate([
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'email' => 'required|email|max:255|unique:users',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate the image
            'code' => 'required|string|max:10',
            'contactNumber' => 'required|string',
            'gender' => 'required|string|in:Male,Female',
            'password' => 'required|string|min:8',
            'qualification' => 'required|string|max:255',
            'address' => 'required|string',
            'experienceLevel' => 'required|string|max:255',
            'educationalLevel' => 'required|string|max:255',
            
        ]);
    
        // Handle image upload
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('public/images'); // Store the image

            $imageUrl = str_replace('public/', '/storage/', $imagePath);
        }
    
        $user = User::create([
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'email' => $request->email,
            'image_url' => $imageUrl, // Save the image URL
            'code' => $request->code,
            'contact_number' => $request->contactNumber,
            'gender' => $request->gender,
            'password' => Hash::make($request->password),
            'qualification' => $request->qualification,
            'address' => $request->address,
            'experience_level' => $request->experienceLevel,
            'educational_level' => $request->educationalLevel,
        
        ]);
    
        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
        ], 201);
    }

      // Login in an existing user 

      public function login(Request $request)   {
          // Validate email and password
          $request->validate([
              'email' => 'required|email',
              'password' => 'required',
          ]);
      
          // Attempt to authenticate the user
          if (!Auth::attempt($request->only('email', 'password'))) {
            
              return response()->json([
                  'message' => 'Invalid credentials',
              ], 401);
          }
      
          // Fetch the authenticated user
          $user = User::where('email', $request->email)->first();
                     // Generate a token
    $token = $user->createToken('auth_token')->plainTextToken;
    if (Auth::check()) {
        $user = Auth::user();
        $today = Carbon::now()->toDateString(); // Get today's date as a string

        // Fetch the existing login dates
        $loginDates = $user->login_dates ?? [];

        // Add today's date if it's not already in the array
        if (!in_array($today, $loginDates)) {
            $loginDates[] = $today;
            $user->login_dates = $loginDates;
            $user->save();
        }
    }

          if (!$user) {
              return response()->json([
                  'message' => 'User not found',
              ], 404);
          }

    // Record the login date
    \Log::info('Before update:', ['login_dates' => $user->login_dates]);
    $loginDates = $user->login_dates ?? []; // Ensure $loginDates is an array
    \Log::info('After update:', ['login_dates' => $loginDates]);
    if (!is_array($loginDates)) {
        $loginDates = []; // Initialize as an array if it's not
    }
    $loginDates[] = now()->toDateString(); // Add today's date
    $user->login_dates = $loginDates;
    $user->save();
      
          // Return success response with user data
          return response()->json([
              'message' => 'Login successful!',
              'user' => [
                  'email' => $user->email,
                  'image' => asset($user->image_url), // Use asset() to generate the full URL // To be able to display the image during the redirection
                  'first_name' => $user->first_name,
                  'last_name' => $user->last_name,
                  
              ],
              'token' => $token, // Ensure this is included
              'redirect' => '/dashboard', // Add a redirect URL for the frontend
          ]);
      }

      public function getLoginDates(Request $request) {
        $user = $request->user();
        return response()->json([
            'login_dates' => $user->login_dates ?? [],
        ]);
    }

 


    public function logout(Request $request){

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message'=> 'Logged out',
        ]);
    }

 
    
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
    
        // Find the user by email
        $user = User::where('email', $request->email)->first();
    
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    
        // Generate a default password: first_name + 5 random numbers
        $defaultPassword = $user->first_name . rand(10000, 99999);
    
        // Update the user's password in the database
        $user->password = Hash::make($defaultPassword);
        $user->save();
    
        // Send the default password to the user's email
        $user->sendPasswordResetNotification($defaultPassword);
    
        return response()->json([
            'message' => 'A default password has been sent to your email.',
        ]);
    }



public function resetPassword(Request $request)
{
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed', // Requires a `password_confirmation` field
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->save();
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json(['message' => 'Password reset successfully.']);
    }

    return response()->json(['message' => 'Invalid token or email.'], 400);
}
    
    

// public function index()
// {
//     $jobs = Job::all();
//     return response()->json($jobs);
// }
// public function index()
// {
//     // Your logic here
//     return response()->json(['message' => 'This is the index method']);
// }

public function getUser(Request $request) {
    // Get the authenticated user
    $user = $request->user();

    // Return the user data as a JSON response
    return response()->json([
        'user' => [
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'image_url' => $user->image_url, // Assuming you have this field in your users table
            'login_dates' => $user->login_dates,
        ],
    ]);
}

     public function indexe(){
        try {
            $employee = User::all();
            
            return response()->json($employee);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
     }



 
    // Hot Matching: Filter users based on all three criteria
    public function getHotMatches(Request $request, $jobId)
    {
        $job = JobPosting::findOrFail($jobId);

        $users = User::where('experience_level', $job->experience_level)
            ->where('educational_level', $job->educational_level)
            ->where('qualification', $job->qualification)
            ->get();

        return response()->json($users);
    }

     // Warm Matching: Filter users based on at least one of the three criteria
     public function getWarmMatches(Request $request, $jobId)
     {
         $job = JobPosting::findOrFail($jobId);
 
         $users = User::where('experience_level', $job->experience_level)
             ->orWhere('educational_level', $job->educational_level)
             ->orWhere('qualification', $job->qualification)
             ->get();
 
         return response()->json($users);
     }
  
      // Perform warm match after a job is posted
    public function postJobAndWarmMatch(Request $request)
    {
        // Validate the job posting data
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
        ]);
       
         // Perform warm matching
         $warmMatches = User::where('experience_level', $jobPosting->experience_level)
         ->orWhere('educational_level', $jobPosting->educational_level)
         ->orWhere('qualification', $jobPosting->qualification)
         ->get();

     return response()->json([
         'message' => 'Job posted and warm matches found',
         'job' => $jobPosting,
         'warm_matches' => $warmMatches,
     ], 201);
 }

 public function updateProfile(Request $request)
 {
     $user = $request->user();
 
     // Log the request data
     \Log::info('Request data:', $request->all());
 
     // Validate the request data
     $request->validate([
         'firstName' => 'nullable|string',
         'lastName' => 'nullable|string',
         'email' => 'nullable|email|unique:users,email,' . $user->id,
         'code' => 'nullable|string',
         'contactNumber' => 'nullable|string',
         'gender' => 'nullable|string|in:Male,Female',
         'password' => 'nullable|string|min:8',
         'qualification' => 'nullable|string',
         'address' => 'nullable|string',
         'experienceLevel' => 'nullable|string',
         'educationalLevel' => 'nullable|string',
         'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
     ]);
 
     // Prepare the update data
     $updateData = [];
     if ($request->has('firstName')) {
         $updateData['first_name'] = $request->input('firstName');
     }
     if ($request->has('lastName')) {
         $updateData['last_name'] = $request->input('lastName');
     }
     if ($request->has('email')) {
         $updateData['email'] = $request->input('email');
     }
     if ($request->has('code')) {
         $updateData['code'] = $request->input('code');
     }
     if ($request->has('contactNumber')) {
         $updateData['contact_number'] = $request->input('contactNumber');
     }
     if ($request->has('gender')) {
         $updateData['gender'] = $request->input('gender');
     }
     if ($request->has('password')) {
         $updateData['password'] = Hash::make($request->input('password'));
     }
     if ($request->has('qualification')) {
         $updateData['qualification'] = $request->input('qualification');
     }
     if ($request->has('address')) {
         $updateData['address'] = $request->input('address');
     }
     if ($request->has('experienceLevel')) {
         $updateData['experience_level'] = $request->input('experienceLevel');
     }
     if ($request->has('educationalLevel')) {
         $updateData['educational_level'] = $request->input('educationalLevel');
     }
 
     // Log the update data
     \Log::info('Update data:', $updateData);
 
     // Handle image upload
     if ($request->hasFile('image')) {
         // Delete the old image if it exists
         if ($user->image_url) {
             Storage::delete(str_replace('/storage/', 'public/', $user->image_url));
         }
 
         // Store the new image
         $imagePath = $request->file('image')->store('public/images');
         $updateData['image_url'] = str_replace('public/', '/storage/', $imagePath);
     }
 
     // Update the user with the new data
     $user->update($updateData);
 
     // Fetch the updated user data from the database
     $updatedUser = User::find($user->id);
 
     // Log the updated user data
     \Log::info('Updated user data:', $updatedUser->toArray());
 
     // Return the updated user data
     return response()->json([
         'message' => 'Profile updated successfully',
         'user' => $updatedUser,
     ]);
 }

 public function applyForJob(Request $request, $JobId)
 {
     try {
         $request->validate([
             'video' => 'required|file|mimetypes:video/mp4,video/quicktime|max:50000',
             'resume' => 'required|file|mimes:pdf,doc,docx|max:5120',
             'convert_resume' => 'sometimes|boolean',
         ]);
 
         $user = $request->user();
         $job = JobPosting::findOrFail($JobId);
 
         if (Applicants::where('job_id', $JobId)->where('email', $user->email)->exists()) {
             return response()->json(['message' => 'You have already applied for this job.'], 400);
         }
 
         // Process video upload
         $videoPath = $this->processVideoUpload($request->file('video'), $user->id, $JobId);
         // Process resume
         $resumePath = $this->processResumeUpload(
             $request->file('resume'), 
             $request->boolean('convert_resume')
         );
 
         // Create application record with full storage paths
         $application = Applicants::create([
             'job_id' => $JobId,
             'first_name' => $user->first_name,
             'last_name' => $user->last_name,
             'email' => $user->email,
             'qualification' => $user->qualification,
             'experienceLevel' => $user->experience_level,
             'educational_level' => $user->educational_level,
             'gender' => $user->gender,
             'image' => $user->image_url,
             'contact_number' => $user->contact_number,
             'address' => $user->address,
             'code' => $user->code,
             'application_date' => now()->toDateString(),
             'status' => 'pending',
             'video_url' => 'storage/'.$videoPath, // Store with storage prefix
             'resume_url' => 'storage/'.$resumePath, // Store with storage prefix
         ]);
 
         event(new NewApplicationEvent($application));
 
         return response()->json([
             'message' => 'Application submitted successfully!',
             'application' => $application,
         ], 201);
 
     } catch (\Exception $e) {
         \Log::error('Error applying for job:', ['error' => $e->getMessage()]);
         return response()->json([
             'message' => 'Failed to apply for the job.',
             'error' => $e->getMessage(),
         ], 500);
     }
 }
 
 protected function processVideoUpload($videoFile, $userId, $jobId)
 {
     try {
         $filename = 'video_' . $userId . '_' . $jobId . '_' . time() . '.mp4';
         
         // Store video in public storage
         $path = $videoFile->storeAs(
             'applications/videos',
             $filename,
             ['disk' => 'public']
         );
         
         return $path; // This will return 'applications/videos/filename.mp4'
     } catch (\Exception $e) {
         \Log::error('Video upload failed:', ['error' => $e->getMessage()]);
         throw new \Exception('Failed to upload video');
     }
 }
 
 
 
 protected function processResumeUpload($resumeFile, $convert)
 {
     try {
        \Log::info('Processing resume upload', [
            'original_name' => $resumeFile->getClientOriginalName(),
            'size' => $resumeFile->getSize(),
            'mime_type' => $resumeFile->getMimeType(),
            'convert' => $convert
        ]);

         $extension = $resumeFile->getClientOriginalExtension();
         $filename = 'resume_' . time() . '.' . ($convert ? 'pdf' : $extension);
         
         if ($convert && in_array($extension, ['doc', 'docx'])) {
             // Implement your DOC to PDF conversion here
             // For now, we'll just store the original
             \Log::warning('Resume conversion requested but not implemented');
         }
         
         $path = $resumeFile->storeAs(
             'applications/resumes',
             $filename,
             ['disk' => 'public', 'visibility' => 'public']
         );

         \Log::info('Resume stored successfully', ['path' => $path]);
         
         return $path;
     } catch (\Exception $e) {
         \Log::error('Resume upload failed:', ['error' => $e->getMessage()]);
         throw new \Exception('Failed to upload resume');
     }
 }

 public function uploadChunk(Request $request, $jobId)
{
    try {
        $request->validate([
            'chunk' => 'required|file',
            'chunkIndex' => 'required|integer',
            'totalChunks' => 'required|integer',
            'filename' => 'required|string',
            'type' => 'required|in:video,resume'
        ]);
        \Log::info('Upload chunk request data:', [
            'has_chunk' => $request->hasFile('chunk'),
            'chunkIndex' => $request->input('chunkIndex'),
            'filename' => $request->input('filename'),
            'type' => $request->input('type')
        ]);

        $user = $request->user();
        $chunk = $request->file('chunk');
        $chunkIndex = $request->input('chunkIndex');
        $totalChunks = $request->input('totalChunks');
        $filename = $request->input('filename');
        $type = $request->input('type');

        // Create temporary directory
        $tempDir = storage_path("app/public/temp/{$type}s/{$user->id}_{$jobId}");
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0777, true);
        }

        // Save the chunk
        $chunk->move($tempDir, $chunkIndex);

        // If this is the last chunk, combine all chunks
        if ($chunkIndex == $totalChunks - 1) {
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $finalFilename = "{$type}_{$user->id}_{$jobId}_" . time() . ".{$extension}";
            $finalPath = storage_path("app/public/applications/{$type}s/{$finalFilename}");
            
            $finalFile = fopen($finalPath, 'wb');
            for ($i = 0; $i < $totalChunks; $i++) {
                $chunkPath = "{$tempDir}/{$i}";
                $chunkContent = file_get_contents($chunkPath);
                fwrite($finalFile, $chunkContent);
                unlink($chunkPath);
            }
            fclose($finalFile);
            rmdir($tempDir);

            return response()->json([
                'message' => 'File upload complete',
                'path' => "applications/{$type}s/{$finalFilename}",
                'type' => $type
            ]);
        }

        return response()->json(['message' => 'Chunk received']);

    } catch (\Exception $e) {
        \Log::error('Chunk upload failed:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Failed to upload chunk',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function applyResume(Request $request, $jobId)
{
    try {
        $request->validate([
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120',
            'convert_resume' => 'sometimes|boolean'
        ]);

        $user = $request->user();
        $job = JobPosting::findOrFail($jobId);

        if (Applicants::where('job_id', $jobId)->where('email', $user->email)->exists()) {
            return response()->json(['message' => 'You have already applied for this job.'], 400);
        }

        $resumePath = $this->processResumeUpload(
            $request->file('resume'),
            $request->boolean('convert_resume')
        );

        // Create application record
        $application = Applicants::create([
            'job_id' => $jobId,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'qualification' => $user->qualification,
            'experienceLevel' => $user->experience_level,
            'educational_level' => $user->educational_level,
            'gender' => $user->gender,
            'image' => $user->image_url,
            'contact_number' => $user->contact_number,
            'address' => $user->address,
            'code' => $user->code,
            'application_date' => now()->toDateString(),
            'status' => 'pending',
            'resume_url' => '/storage/' . $resumePath,
        ]);

        event(new NewApplicationEvent($application));

        return response()->json([
            'message' => 'Application submitted successfully!',
            'application' => $application,
        ], 201);

    } catch (\Exception $e) {
        \Log::error('Error applying for job:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Failed to apply for the job.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

 public function getAppliedJobs(Request $request)
 {
     // Get the authenticated user
     $user = $request->user();
 
     // Fetch the number of jobs applied by the user
     $appliedJobsCount = Applicants::where('email', $user->email)->count();
 
     return response()->json([
         'count' => $appliedJobsCount,
     ]);
 }



public function getApplicationStatus(Request $request)
{
    // Get the authenticated user
    $user = $request->user();

    // Fetch the application status for the user
    $acceptedCount = Applicants::where('email', $user->email)->where('status', 'accepted')->count();
    $deniedCount = Applicants::where('email', $user->email)->where('status', 'denied')->count();

    return response()->json([
        'accepted' => $acceptedCount,
        'denied' => $deniedCount,
    ]);
}
// In your AutheController.php
public function getApplyJobs(Request $request)
{
    // Get the authenticated user
    $user = $request->user();

    \Log::info('Fetching applied jobs for user:', ['email' => $user->email]);

    try {
        // Fetch the applied jobs for the user
        $appliedJobs = Applicants::where('email', $user->email)
            ->join('job_posting', '_applicants.job_id', '=', 'job_posting.id')
            ->select('_applicants.*', 'job_posting.job_title')
            ->get();

        \Log::info('Applied jobs fetched successfully:', ['count' => $appliedJobs->count()]);

        return response()->json($appliedJobs);
    } catch (\Exception $e) {
        \Log::error('Error fetching applied jobs:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Failed to fetch applied jobs.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function updateApplicationStatus(Request $request, $applicantId)
{
    try {
        $request->validate([
            'status' => 'required|in:accepted,denied,pending'
        ]);

        $applicant = Applicants::findOrFail($applicantId);
        $applicant->status = $request->status;
        $applicant->save();

        return response()->json([
            'message' => 'Application status updated successfully',
            'applicant' => $applicant
        ]);
    } catch (\Exception $e) {
        \Log::error('Error updating application status:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Failed to update application status',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function getApplicant($id)
{
    try {
        $applicant = Applicants::findOrFail($id);
        return response()->json($applicant);
    } catch (\Exception $e) {
        \Log::error('Error fetching applicant:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Failed to fetch applicant',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
