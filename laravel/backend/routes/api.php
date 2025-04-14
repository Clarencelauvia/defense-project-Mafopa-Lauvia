<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutheController;
use App\Http\Controllers\jobpostingController;
use App\Http\Controllers\EntreInfController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\EmployerJobController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\TwilioController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationeController;
use App\Http\Controllers\AlertController;
use App\Models\Applicants;
use App\Events\ApplicantStatusUpdated;
use App\Http\Controllers\ApplicantStatusController;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/



Route::post('/register', [AutheController::class, 'register']);
Route::post('/login', [AutheController::class, 'login']);
Route::get('/login-dates', [AutheController::class, 'getLoginDates'])->middleware('auth:sanctum');

Route::post('/jobPost', [jobpostingController::class, 'jobPost'] );
// Route::middleware(['auth:sanctum', 'employer'])->group(function () {
//     Route::post('/jobPost', [jobpostingController::class, 'jobPost']);
// });

Route::post('/jobPost', [jobpostingController::class, 'jobPost'])->middleware('auth:entre_inf,sanctum');
Route::post('/entrepreneur', [EntreInfController::class, 'entrepreneur'] );
Route::post('/logine', [EntreInfController::class, 'logine'] )->middleware('cors');
// In routes/api.php
Route::put('/employer/modify-profile', [EntreInfController::class, 'updateProfile'])->middleware('auth:sanctum');
// In routes/api.php
Route::get('/employer', [EntreInfController::class, 'getEmployer'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employer/login-dates', [EntreInfController::class, 'getLoginDates']);
});

Route::get('/applicants/{id}/check-files', [AutheController::class, 'checkFiles']);

Route::middleware('auth:sanctum')->get('/jobs/recommended', [JobController::class, 'getRecommendedJobs']);

Route::middleware(['cors'])->group(function () {
    Route::post('/logine', [EntreInfController::class, 'logine']);
    Route::middleware('auth:sanctum')->get('/user', [EntreInfController::class, 'getEmployer']);
});


Route::get('/employer/manage-jobs', [EmployerJobController::class, 'manageJobs'])->middleware('auth:sanctum');

Route::put('/employer/jobs/{id}', [EmployerJobController::class, 'updateJob'])->middleware('auth:sanctum');
Route::delete('/employer/jobs/{id}', [EmployerJobController::class, 'deleteJob'])->middleware('auth:sanctum');

Route::get('/employer/jobs/{jobId}', [EmployerJobController::class, 'getJob'])->middleware('auth:sanctum');
// Route to fetch the informations for the user profile
Route::get('/employeePage',[AutheController::class, 'indexe'] );

// Route to post the job seeker profile
Route::post('/employeePage',[AutheController::class, 'register'] );

// Route to fetch informations for th employers profile 
Route::get('/employerPage',[EntreInfController::class, 'indexes'] );

// Route to post the employers profile 
Route::post('/employeePage', [EntreInfController::class, '/entrepreneur'] );



// Route to fetch all jobs (GET request)
Route::get('/jobs', [JobPostingController::class, 'index']);

// Route to post a new job (POST request)
Route::post('/jobs', [JobPostingController::class, 'jobPost'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/jobPost', [JobPostingController::class, 'jobPost']);
});
Route::middleware('auth:sanctum')->post('/jobs', [JobPostingController::class, 'jobPost']);

// Forgot Password Route

Route::post('/sendResetLinkEmail', [AutheController::class, 'sendResetLinkEmail']);

// Reset Password Route
Route::post('/resetPassword', [EntreInfController::class, 'resetPassword']);


Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/jobs/post-and-warm-match', [AutheController::class, 'postJobAndWarmMatch']);
Route::get('/jobs/{jobId}/hot-matches', [AutheController::class, 'getHotMatches']);
Route::get('/jobs/{jobId}/warm-matches', [AutheController::class, 'getWarmMatches']);


// Route for saving Jobs 
Route::post('/jobs/{job}/save', [JobController::class, 'saveJob']);
Route::get('/saved-jobs', [JobController::class, 'getSavedJobs']);




// Fetch a single job by ID
Route::get('/jobs/{id}', [JobPostingController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/jobs/{job}/save', [JobController::class, 'saveJob']);
    Route::get('/saved-jobs', [JobController::class, 'getSavedJobs']);
});
Route::middleware('auth:sanctum')->post('/jobs/{id}/save', [JobController::class, 'saveJob']);

// route for unsaving jobs 
Route::delete('/jobs/{job}/unsave', [JobController::class, 'unsave'])->middleware('auth:sanctum');
Route::delete('/saved-jobs/{job}', [JobController::class, 'unsave'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/jobs/{job}/save', [JobController::class, 'saveJob']);
    Route::delete('/jobs/{job}/unsave', [JobController::class, 'unsave']);
    Route::get('/saved-jobs', [JobController::class, 'getSavedJobs']);
});
Route::get('/jobs/{job}/application-status', [JobController::class, 'getApplicationStatus'])
    ->middleware('auth:sanctum');
// route to update th user profile 
Route::put('/user/update', [AutheController::class, 'updateProfile'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->put('/user/update', [AutheController::class, 'updateProfile']);

// Employer routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employer', [EntreInfController::class, 'getEmployer']);
    Route::get('/employer/jobs', [EntreInfController::class, 'getPostedJobs']);
    Route::get('/employer/applicants', [EntreInfController::class, 'getApplicants']);
    Route::get('/employer/login-dates', [EntreInfController::class, 'getLoginDates']);
    Route::get('/employer/applicant/{id}', [EntreInfController::class, 'getApplicantById']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/jobs/{JobId}/apply', [AutheController::class, 'applyForJob']);
});
Route::post('/jobs/{id}/apply', [AutheController::class, 'applyForJob']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/apply-jobs', [AutheController::class, 'getAppliedJobs']); // Fetch applied jobs
    Route::get('/application-status', [AutheController::class, 'getApplicationStatus']); // Fetch application status
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/applied-jobs', [AutheController::class, 'getApplyJobs']);
});

// for sms and phone calls
Route::post('/twiml', function () {
    $response = new \Twilio\TwiML\VoiceResponse();
    $response->say('Hello, this is a call from the job matching platform.');
    return response($response)->header('Content-Type', 'text/xml');
});

// Route::post('/send-message', [ChatController::class, 'sendMessage']);
// Route::get('/fetch-messages/{senderId}/{receiverId}', [ChatController::class, 'fetchMessages']);
// Route::get('/messages/recent/{employerId}', [ChatController::class, 'fetchRecentMessages']);


Route::prefix('chat')->middleware('auth:sanctum')->group(function () {
    Route::post('/session', [ChatController::class, 'getOrCreateSession']);

    Route::post('/send/{sessionId}', [ChatController::class, 'sendMessage']);

    Route::get('/messages/{sessionId}', [ChatController::class, 'getMessages']);

    Route::post('/mark-read', [ChatController::class, 'markMessagesAsRead']);

    Route::delete('/messages/{messageId}', [ChatController::class, 'deleteMessage']);
});

Route::get('/users/{userId}', [EntreInfController::class, 'getUser']);
// Route::delete('/messages/{messageId}', [ChatController::class, 'deleteMessage']);

Route::middleware('auth:sanctum')->get('/current-user', function (Request $request) {
    return $request->user();
});
Route::middleware('auth:sanctum')->get('/current-user', function (Request $request) {
    return $request->user();
});

Route::get('/messages/unread-count/{userId}', [ChatController::class, 'getUnreadCount'])
    ->middleware('auth:sanctum');

    Route::get('/messages/recent/{userId}', [ChatController::class, 'getRecentMessages'])
    ->middleware('auth:sanctum');
    Route::get('/messages/contacts', [ChatController::class, 'getContactsWithUnreadCounts'])->middleware('auth:sanctum');


    Route::get('/employer/applicant/{id}', [EntreInfController::class, 'getApplicantById'])
    ->middleware('auth:sanctum');

    Route::put('/applicants/{applicantId}/status', [AutheController::class, 'updateApplicationStatus'])
    ->middleware('auth:sanctum');

Route::get('/applicants/{id}', [AutheController::class, 'getApplicant'])
    ->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        // Chunked file upload
        Route::post('/jobs/{job}/upload-chunk', [AutheController::class, 'uploadChunk']);
        
        // Resume submission
        Route::post('/jobs/{job}/apply-resume', [AutheController::class, 'applyResume']);
        
        // Application endpoint
        Route::post('/applications/{application}/complete', [AutheController::class, 'completeApplication']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/jobs/{jobId}/apply', [AutheController::class, 'applyForJob']);
    });
    Route::put('/employer/applicants/{applicantId}/status', [EntreInfController::class, 'updateApplicantStatus'])
    ->middleware('auth:sanctum');
    Route::middleware('auth:sanctum')->post('/jobs/{jobId}/upload-chunk', [AutheController::class, 'uploadChunk']);
    
    Route::options('/{any}', function () {
        return response()->json();
    })->where('any', '.*');

    Route::post('/admin/login', [AdminController::class, 'login']);
Route::middleware('auth:sanctum')->post('/admin/logout', [AdminController::class, 'logout']);
Route::post('/admin/forgot-password', [AdminController::class, 'sendResetLinkEmail']);
Route::post('/admin/reset-password', [AdminController::class, 'resetPassword']);


Route::get('/api/upload-test', function() {
    \Log::info('Upload test started');
    
    $start = microtime(true);
    $tempFile = tempnam(sys_get_temp_dir(), 'test');
    file_put_contents($tempFile, random_bytes(10 * 1024 * 1024)); // 10MB file
    
    $result = [
        'write_speed' => round(10 / (microtime(true) - $start), 2) . ' MB/s',
        'timestamp' => now()->toDateTimeString()
    ];
    
    unlink($tempFile);
    
    \Log::info('Upload test completed', $result);
    return response()->json($result);
});

Route::middleware('auth:sanctum')->post('/jobs/{jobId}/finalize-application', [AutheController::class, 'finalizeApplication']);
Route::get('/notifications', [NotificationController::class, 'index']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

// In api.php
// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/notifications', [NotificationeController::class, 'index']);
//     Route::put('/notifications/{id}/read', [NotificationeController::class, 'markAsRead']);
//     Route::get('/notifications/unread-count', [NotificationeController::class, 'unreadCount']);
// });

// for the notification when posting jobs 
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::put('/alerts/{id}/read', [AlertController::class, 'markAsRead']);
    Route::get('/alerts/unread-count', [AlertController::class, 'unreadCount']);
    Route::put('/employer/applicants/{id}/status', 
    [ApplicantStatusController::class, 'update']);
});

Route::put('/employer/applicants/{id}/status', function (Request $request, $id) {
    $request->validate([
        'status' => 'required|in:accepted,denied,pending,reviewed'
    ]);

    $applicant = Applicants::findOrFail($id);
    $oldStatus = $applicant->status;
    $applicant->status = $request->status;
    $applicant->save();

    // Broadcast the status update
    event(new ApplicantStatusUpdated($applicant, $request->status));

    return response()->json([
        'message' => 'Status updated successfully',
        'data' => $applicant
    ]);
})->middleware('auth:sanctum');




Route::post('/pusher/auth', function (Request $request) {
    if (!Auth::check()) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $user = Auth::user();
    $pusher = new Pusher\Pusher(
        config('broadcasting.connections.pusher.key'),
        config('broadcasting.connections.pusher.secret'),
        config('broadcasting.connections.pusher.app_id'),
        config('broadcasting.connections.pusher.options')
    );

    return $pusher->socket_auth($request->channel_name, $request->socket_id);
})->middleware('auth:sanctum');

