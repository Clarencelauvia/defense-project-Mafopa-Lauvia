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
use App\Models\LoginDate;
use Dompdf\Dompdf;




class AutheController extends Controller
{
   

    public function register(Request $request) {
        \Log::info('Registration request data:', $request->all());
    
        $request->validate([
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'email' => 'required|email|max:255|unique:users',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
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
            'image_url' => $imageUrl, 
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

      public function login(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
    
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
    
        $user = Auth::user();
        $today = now()->toDateString();
        
        // Initialize login_dates if it doesn't exist
        $loginDates = $user->login_dates ?? [];
        $today = now()->format('Y-m-d');
        
         // Add today's date if not already present
    if (!in_array($today, $loginDates)) {
        $loginDates[] = $today;
        $user->login_dates = $loginDates;
        $user->save();
        
        // Also store in LoginDate model
        LoginDate::create([
            'user_id' => $user->id,
            'login_date' => $today
        ]);
    }
    
        $token = $user->createToken('auth_token')->plainTextToken;
    
        return response()->json([
            'message' => 'Login successful!',
            'user' => [
                'email' => $user->email,
                'image' => asset($user->image_url),
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
            ],
            'token' => $token,
            'redirect' => '/dashboard',
        ]);
    }

    public function getLoginDates(Request $request) {
        $user = $request->user();
        
        // Get dates from both sources and ensure proper format
        $userDates = $user->login_dates ?? [];
        $modelDates = LoginDate::where('user_id', $user->id)
            ->pluck('login_date')
            ->map(function ($date) {
                return $date instanceof \DateTimeInterface 
                    ? $date->format('Y-m-d') 
                    : (string) $date;
            })
            ->toArray();
        
        // Combine and deduplicate
        $allDates = array_unique(array_merge(
            $this->normalizeDates($userDates),
            $modelDates
        ));
        
        return response()->json([
            'login_dates' => array_values($allDates),
        ]);
    }
    
    protected function normalizeDates(array $dates): array
    {
        return array_map(function ($date) {
            try {
                return \Carbon\Carbon::parse($date)->format('Y-m-d');
            } catch (\Exception $e) {
                \Log::error('Failed to normalize date', ['date' => $date, 'error' => $e]);
                return null;
            }
        }, array_filter($dates));
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

 public function applyForJob(Request $request, $jobId)
 {
     \Log::info('Starting application process', ['jobId' => $jobId]);
 
     try {
         // Validate request
         $request->validate([
             'video' => 'required|file|mimetypes:video/mp4,video/quicktime|max:50000',
             'resume' => 'required|file|mimes:pdf,doc,docx|max:5120',
         ]);
 
         $user = $request->user();
 
         // Check for existing application
         if (Applicants::where('job_id', $jobId)->where('email', $user->email)->exists()) {
             return response()->json(['message' => 'You have already applied for this job.'], 409);
         }
 
         // Handle video upload
         $videoPath = $request->file('video')->store('public/applications/videos');
 
         // Handle resume upload and conversion
         $resumeFile = $request->file('resume');
         $resumePath = $this->processResumeUpload($resumeFile);
 
         // Create application with all required fields
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
             'video_url' => '/storage/' . str_replace('public/', '', $videoPath),
             'resume_url' => '/storage/' . str_replace('public/', '', $resumePath),
         ]);
 
         event(new NewApplicationEvent($application));
 
         return response()->json([
             'message' => 'Application submitted successfully!',
             'application' => $application,
         ], 201);
     } catch (\Exception $e) {
         \Log::error('Application error:', ['error' => $e->getMessage()]);
         return response()->json(['message' => 'Failed to submit application'], 500);
     }
 }
 
 
 protected function processResumeUpload($resumeFile)
 {
     try {
         $extension = $resumeFile->getClientOriginalExtension();
         $filename = 'resume_' . time() . '.pdf';
         $path = 'public/applications/resumes/' . $filename;
 
         if ($extension !== 'pdf') {
             // Convert to PDF using Dompdf
             $pdf = new Dompdf();
             $pdf->loadHtml(file_get_contents($resumeFile->getRealPath()));
             $pdf->render();
             Storage::put($path, $pdf->output());
         } else {
             $path = $resumeFile->storeAs('public/applications/resumes', $filename);
         }
 
         return $path;
     } catch (\Exception $e) {
         \Log::error('Resume upload failed:', ['error' => $e->getMessage()]);
         throw new \Exception('Failed to upload or convert resume');
     }
 }
 protected function checkFileExists($path)
{
    $fullPath = storage_path('app/public/' . $path);
    $exists = file_exists($fullPath);
    \Log::info('Checking file existence', [
        'path' => $path,
        'full_path' => $fullPath,
        'exists' => $exists
    ]);
    return $exists;
}

public function checkFiles($id)
{
    try {
        $applicant = Applicants::findOrFail($id);
        
        $videoExists = $applicant->video_url ? $this->checkFileExists($applicant->video_url) : false;
        $resumeExists = $applicant->resume_url ? $this->checkFileExists($applicant->resume_url) : false;
        
        return response()->json([
            'video_exists' => $videoExists,
            'resume_exists' => $resumeExists,
            'video_path' => $applicant->video_url,
            'resume_path' => $applicant->resume_url,
            'storage_path' => storage_path('app/public')
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

protected function processVideoUpload($videoFile, $userId, $jobId)
{
    try {
        $filename = 'video_' . $userId . '_' . $jobId . '_' . time() . '.mp4';
        $path = $videoFile->storeAs('applications/videos', $filename, 'public');
        return $path; // Ensure this returns the correct path
    } catch (\Exception $e) {
        \Log::error('Video upload failed:', ['error' => $e->getMessage()]);
        throw new \Exception('Failed to upload video');
    }
}

// protected function processResumeUpload($resumeFile, $convert)
// {
//     try {
//         $extension = $convert ? 'pdf' : $resumeFile->getClientOriginalExtension();
//         $filename = 'resume_' . time() . '.' . $extension;
//         $path = $resumeFile->storeAs('applications/resumes', $filename, 'public');
//         return $path; // Ensure this returns the correct path
//     } catch (\Exception $e) {
//         \Log::error('Resume upload failed:', ['error' => $e->getMessage()]);
//         throw new \Exception('Failed to upload resume');
//     }
// }



public function uploadChunk(Request $request, $jobId)
{
    \Log::info('Starting chunk upload', [
        'job_id' => $jobId,
        'user_id' => $request->user()->id,
        'chunk_index' => $request->input('chunkIndex'),
        'total_chunks' => $request->input('totalChunks'),
        'file_type' => $request->input('type'),
        'file_size' => $request->file('chunk')->getSize(),
        'timestamp' => now()->toDateTimeString(),
        'request_data' => $request->all(), 
        'files' => $request->file() 
    ]);

    try {
        $request->validate([
            'chunk' => 'required|file',
            'chunkIndex' => 'required|integer',
            'totalChunks' => 'required|integer',
            'filename' => 'required|string',
            'type' => 'required|in:video,resume'
        ]);

         // Ensure the chunk file exists
         if (!$request->hasFile('chunk')) {
            \Log::error('No chunk file found in request');
            return response()->json(['message' => 'No file uploaded'], 400);
        }

        $type = $request->input('type');
        $userId = $request->user()->id;
        $tempDir = storage_path("app/temp/{$type}_uploads/{$userId}_{$jobId}");
        
        \Log::debug('Creating temp directory if needed', ['path' => $tempDir]);
        
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0777, true);
        }

        $chunk = $request->file('chunk');
        $chunkPath = "{$tempDir}/{$request->input('chunkIndex')}";
        
        $startTime = microtime(true);
        $chunk->move($tempDir, $request->input('chunkIndex'));
        $moveTime = microtime(true) - $startTime;
        
        \Log::debug('Chunk saved', [
            'chunk_path' => $chunkPath,
            'move_time_seconds' => round($moveTime, 3),
            'timestamp' => now()->toDateTimeString()
        ]);

        if ($request->input('chunkIndex') == $request->input('totalChunks') - 1) {
            \Log::info('Starting final file assembly', [
                'total_chunks' => $request->input('totalChunks'),
                'timestamp' => now()->toDateTimeString()
            ]);
            
            $finalFilename = uniqid() . '_' . $request->input('filename');
            $finalPath = "applications/{$type}s/{$finalFilename}";
            $finalStoragePath = storage_path("app/public/{$finalPath}");
            
            $assemblyStart = microtime(true);
            $finalHandle = fopen($finalStoragePath, 'wb');
            
            for ($i = 0; $i < $request->input('totalChunks'); $i++) {
                $chunkPath = "{$tempDir}/{$i}";
                $chunkStart = microtime(true);
                $chunkContent = file_get_contents($chunkPath);
                $readTime = microtime(true) - $chunkStart;
                
                $writeStart = microtime(true);
                fwrite($finalHandle, $chunkContent);
                $writeTime = microtime(true) - $writeStart;
                
                unlink($chunkPath);
                
                \Log::debug('Chunk processed', [
                    'chunk_index' => $i,
                    'read_time_seconds' => round($readTime, 4),
                    'write_time_seconds' => round($writeTime, 4),
                    'timestamp' => now()->toDateTimeString()
                ]);
            }
            
            fclose($finalHandle);
            $assemblyTime = microtime(true) - $assemblyStart;
            
            @rmdir($tempDir);
            
            \Log::info('File assembly complete', [
                'final_path' => $finalPath,
                'total_size' => filesize($finalStoragePath),
                'assembly_time_seconds' => round($assemblyTime, 2),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'message' => 'File upload complete',
                'path' => $finalPath,
                'type' => $type
            ]);
        }

        return response()->json(['message' => 'Chunk received']);

    } catch (\Exception $e) {
        \Log::error('Chunk upload failed', [
            'error' => $e->getMessage(),
            'stack_trace' => $e->getTraceAsString(),
            'timestamp' => now()->toDateTimeString()
        ]);
        return response()->json([
            'message' => 'Failed to upload chunk',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function finalizeApplication(Request $request, $jobId)
{
    \Log::info('Starting application finalization', [
        'job_id' => $jobId,
        'user_id' => $request->user()->id,
        'resume_file' => $request->input('resumeFileName'),
        'video_file' => $request->input('videoFileName'),
        'timestamp' => now()->toDateTimeString()
    ]);

    try {
        $request->validate([
            'resumeFileName' => 'required|string',
            'videoFileName' => 'required|string'
        ]);

        $user = $request->user();
        $job = JobPosting::findOrFail($jobId);

        if (Applicants::where('job_id', $jobId)->where('email', $user->email)->exists()) {
            \Log::warning('Duplicate application attempt', [
                'job_id' => $jobId,
                'user_email' => $user->email,
                'timestamp' => now()->toDateTimeString()
            ]);
            return response()->json(['message' => 'You have already applied for this job.'], 409);
        }

        $applicationData = [
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
            'application_date' => now()->toDateTimeString(),
            'status' => 'pending',
            'video_url' => '/storage/' . $request->videoFileName,
            'resume_url' => '/storage/' . $request->resumeFileName,
        ];

        \Log::debug('Creating application record', $applicationData);
        
        $startTime = microtime(true);
        $application = Applicants::create($applicationData);
        $dbTime = microtime(true) - $startTime;
        
        \Log::info('Application record created', [
            'application_id' => $application->id,
            'db_insert_time_seconds' => round($dbTime, 3),
            'timestamp' => now()->toDateTimeString()
        ]);

        event(new NewApplicationEvent($application));

        \Log::info('Application finalized successfully', [
            'application_id' => $application->id,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json([
            'message' => 'Application submitted successfully!'
        ], 201);

    } catch (\Exception $e) {
        \Log::error('Error finalizing application', [
            'error' => $e->getMessage(),
            'stack_trace' => $e->getTraceAsString(),
            'timestamp' => now()->toDateTimeString()
        ]);
        return response()->json([
            'message' => 'Failed to submit application',
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

// public function updateApplicationStatus(Request $request, $applicantId)
// {
    
//     try {
//         $request->validate([
//             'status' => 'required|in:accepted,denied,pending'
//         ]);

//         $applicant = Applicants::findOrFail($applicantId);
//         $applicant->status = $request->status;
//         $applicant->save();

//         return response()->json([
//             'message' => 'Application status updated successfully',
//             'applicant' => $applicant
//         ]);
//     } catch (\Exception $e) {
//         \Log::error('Error updating application status:', ['error' => $e->getMessage()]);
//         return response()->json([
//             'message' => 'Failed to update application status',
//             'error' => $e->getMessage()
//         ], 500);
//     }
// }

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
