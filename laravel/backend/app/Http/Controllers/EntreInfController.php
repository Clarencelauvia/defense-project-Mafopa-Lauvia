<?php

namespace App\Http\Controllers;




use Illuminate\Http\Request;
use App\Models\EntreInf;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use App\Models\EmployerLoginDate; // Import the EmployerLoginDate model
use App\Models\Applicants; // Import the Applicant model
use App\Models\Job; // Import the Job model
use App\Models\JobPosting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Events\ApplicantStatusUpdated;
use Illuminate\Support\Facades\Mail;
use App\Events\NewUserRegistered;

class EntreInfController extends Controller
{
    public function entrepreneur(Request $request){
        \Log::info('Registration request data:', $request->all());

        $request->validate([
            'first_name'=>'required|string',
            'last_name'=>'required|string',
            'email'=>'required|email|max:255|unique:entre_inf',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate the image
            'code'=>'required|string|max:10',
            'contact_number'=>'required|string|max:15',
            'gender'=>'required|string|in:Male,Female',
            'password'=>'required|string|min:8',
            'organisation_name'=>'required|string|max:255',
            'domain'=>'required|string|max:255',
            'address'=>'required|string',
        ]);

           // Handle image upload
           $imageUrl = null;
           if ($request->hasFile('image')) {
               $imagePath = $request->file('image')->store('public/images'); // Store the image
   
               $imageUrl = str_replace('public/', '/storage/', $imagePath);
           }

        $entreInf = EntreInf::create([
            'first_name'=>$request->first_name,
            'last_name'=>$request->last_name,
            'email'=>$request->email,
            'image_url' => $imageUrl, // Save the image URL
            'code'=>$request->code,
            'contact_number'=>$request->contact_number,
            'gender'=>$request->gender,
            'password'=>Hash::make($request->password),
            'organisation_name'=>$request->organisation_name,
            'domain'=>$request->domain,
            'address'=>$request->address
        ]);
                // $token = $user->createToken('auth_token')->plainTextToken;
    
        
    // Broadcast event
    broadcast(new NewUserRegistered($entreInf, 'employer'))->toOthers();

    \App\Models\Notication::create([
        'type' => 'employer',
        'message' => 'New employer registered: ' . $entreInf->organisation_name
    ]);
                return response()->json([
                    'message'=>'User registered successfully',
                    'user'=> $entreInf,
                  
                ],201); 
                // 201 = created

              
    }

        // Login in an existing user 


        public function logine(Request $request)
        {
            // Validate email and password
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|min:8',
            ]);
        
               // Log the credentials being used
    \Log::info('Login attempt:', ['email' => $request->email, 'password' => $request->password]);
    $credentials = $request->only('email', 'password');
    \Log::info('Attempting login with credentials:', $credentials);

            // Attempt to authenticate the user
            if (!Auth::guard('entre_inf')->attempt($request->only('email', 'password'))) {
                \Log::info('Auth::attempt failed for email:', ['email' => $request->email]);
                return response()->json([
                    'message' => 'Invalid credentials',
                ], 401);
            }
        
            // Fetch the authenticated user
            $entreInf = EntreInf::where('email', $request->email)->first();
                             // Generate a token
    $token = $entreInf->createToken('auth_token')->plainTextToken;
    // Log login date
    $this->logLoginDate($entreInf->id);
            if (!$entreInf) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);
            }
        
            // Return success response with user data
            return response()->json([
                'message' => 'Login successful!',
                'entre_inf' => [
                    'email' => $entreInf->email,
                    'image' => asset($entreInf->image_url), // Use asset() to generate the full URL // To be able to display the image during the redirection
                    'first_name' => $entreInf->first_name,
                    'last_name' => $entreInf->last_name,
                ],
                'token' => $token, // Ensure this is included
                'redirect' => '/employer_dashboard', // Add a redirect URL for the frontend
            ]);
        }


        

        public function resetPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
    
        // Find the user by email
        $entreInf = EntreInf::where('email', $request->email)->first();
    
        if (!$entreInf) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    
        // Generate a default password: first_name + 5 random numbers
        $defaultePassword = $entreInf->first_name . rand(10000, 99999);
    
        // Update the user's password in the database
        $entreInf->password = Hash::make($defaultePassword);
        $entreInf->save();
    
        // Send the default password to the user's email
        $entreInf->sendPasswordResetNotification($defaultePassword);
    
        return response()->json([
            'message' => 'A default password has been sent to your email.',
        ]);
    }
    


        public function logout(Request $request){

            $request->user()->currentAccessToken()->delete();
    
            return response()->json([
                'message'=> 'Logged out',
            ]);
        }
        public function indexes(){
            try {
                $employer = EntreInf::all();
                
                return response()->json($employer);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
         }

public function getEmployer(Request $request)
{
    $employer = $request->user(); // Assuming the employer is authenticated
    // $employer = $request->user();
    return response()->json($employer);
    // return response()->json([
    //     'first_name' => $employer->first_name,
    //     'last_name' => $employer->last_name,
    //     'email' => $employer->email,
    //     'image_url' => $employer->image_url,
    //     'organisation_name' => $employer->organisation_name,
    //     'domain' => $employer->domain,
    //     'address' => $employer->address,
    // ]);
}
public function updateProfile(Request $request)
{
    $employer = $request->user();

    $request->validate([
        'first_name'=>'required|string',
        'last_name'=>'required|string',
        'email'=>'required|email|max:255|unique:entre_inf',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate the image
        'code'=>'required|string|max:10',
        'contact_number'=>'required|string|max:15',
        'gender'=>'required|string|in:Male,Female',
        'password'=>'required|string|min:8',
        'organisation_name'=>'required|string|max:255',
        'domain'=>'required|string|max:255',
        'address'=>'required|string',
    ]);

    $employer->update($request->all());
    
    $employer = $request->user();
    $employer->update($request->except('image'));

    if ($request->hasFile('image')) {
        $imagePath = $request->file('image')->store('images', 'public');
        $employer->image_url = $imagePath;
        $employer->save();
    }

    return response()->json(['message' => 'Profile updated successfully']);
}

public function logLoginDate($employerId)
{
    $today = now()->toDateString();

    // Check if a login record already exists for today
    $exists = EmployerLoginDate::where('entre_inf_id', $employerId)
        ->where('login_date', $today)
        ->exists();

    // If no record exists, create a new one
    if (!$exists) {
        EmployerLoginDate::create([
            'entre_inf_id' => $employerId,
            'login_date' => $today,
        ]);
    }
}


public function getPostedJobs(Request $request)
{
    try {
        $employer = $request->user();
        $jobs = JobPosting::where('entre_inf_id', $employer->id)->get();
        return response()->json($jobs);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to fetch posted jobs.',
            'error' => $e->getMessage(),
        ], 500);
    }

}


public function getApplicants(Request $request)
{
    try{
        $employer = $request->user();
        $jobs = JobPosting::where('entre_inf_id', $employer->id)->pluck('id');
        $applicants = Applicants::whereIn('job_id', $jobs)->get();
        return response()->json($applicants);
    } catch(\Exception $e) {
        \Log::error('failed to fetch' .$e->getMessage());
        return response()->json([
            'message' => 'Failed to fetch applicants.',
            'error' => $e->getMessage(),
        ], 500);

    }

}

public function getLoginDates(Request $request)
{
    try {
        // Get the authenticated employer
        $employer = $request->user();

        // Fetch login dates for the employer
        $loginDates = EmployerLoginDate::where('entre_inf_id', $employer->id)
            ->pluck('login_date')
            ->toArray();

        return response()->json(['login_dates' => $loginDates]);
    } catch (\Exception $e) {
        \Log::error('Failed to fetch login dates: ' . $e->getMessage());
        return response()->json([
            'message' => 'Failed to fetch login dates.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function getApplicantById($id)
{
    try {
        $applicant = Applicants::findOrFail($id);

            \Log::info('Raw applicant data:', [
            'db_video_url' => $applicant->video_url,
            'db_resume_url' => $applicant->resume_url
        ]);      
       
        $applicant->video_url = $applicant->video_url ? 
            Storage::url(str_replace('/storage/', '', $applicant->video_url)) : 
            null;
        
        $applicant->resume_url = $applicant->resume_url ? 
            Storage::url(str_replace('/storage/', '', $applicant->resume_url)) : 
            null;
     

        if (!$applicant->first_name || !$applicant->last_name) {
            throw new \Exception('Applicant data is missing required name fields');
        }

           return response()->json([
            'id' => $applicant->id,
            'first_name' => $applicant->first_name,
            'last_name' => $applicant->last_name,
            'email' => $applicant->email,
            'gender' => $applicant->gender,
            'password'=>$applicant->password,
            'status' => $applicant->status,
            'image' => $applicant->image,
            'contact_number' => $applicant->contact_number,
            'job_id' => $applicant->job_id,
            'job_title' => $applicant->job_title,
            'job_description' => $applicant->job_description,
            'video_url' => $applicant->video_url ? url($applicant->video_url) : null,
            'resume_url' => $applicant->resume_url ? url($applicant->resume_url) : null,
            'created_at' => $applicant->created_at,
            'updated_at' => $applicant->updated_at,
            'job' => $applicant->job,
            'job_posting' => $applicant->jobPosting,
            'entre_inf' => $applicant->entre_inf,
            'entre_inf_id' => $applicant->entre_inf_id,
            'qualification' => $applicant->qualification,
            'educational_level' => $applicant->educational_level,
            'address' => $applicant->address,
            'skills' => $applicant->skills,
            'experienceLevel'=> $applicant->experienceLevel,
            'application_date' => $applicant->application_date
        ]);



        return response()->json([
            'applicant' => $applicant,
            'video_content' => $videoContent,
            'resume_content' => $resumeContent,
        ]);
    } catch (\Exception $e) {
        \Log::error('Failed to fetch applicant', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Failed to fetch applicant details'], 500);
    }
}

// In EntreInfController.php
public function updateApplicantStatus(Request $request, $id)
{
    \Log::info('Updating applicant status', [
        'applicant_id' => $id,
        'request_data' => $request->all()
    ]);

    try {
        $request->validate([
            'status' => 'required|in:accepted,denied,pending'
        ]);

        $applicant = Applicants::findOrFail($id);
        \Log::info('Found applicant:', $applicant->toArray());

        $oldStatus = $applicant->status;
        $applicant->status = $request->status;
        $applicant->save();

        \Log::info('Status updated successfully', [
            'old_status' => $oldStatus,
            'new_status' => $request->status
        ]);

        // Dispatch the event
        event(new ApplicantStatusUpdated($applicant, $request->status));

        return response()->json([
            'message' => 'Applicant status updated successfully',
            'applicant' => $applicant
        ]);

    } catch (\Exception $e) {
        \Log::error('Failed to update status', [
            'error' => $e->getMessage(),
            'stack_trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'message' => 'Failed to update status',
            'error' => $e->getMessage()
        ], 500);
    }
}

// UserController.php
public function getUser($userId)
{
    $user = EntreInf::find($userId); // Assuming you have a User model
    
    if ($user) {
        return response()->json($user);
    }
    return response()->json(['error' => 'User not found'], 404);
}


}
