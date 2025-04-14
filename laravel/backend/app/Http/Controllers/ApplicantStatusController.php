<?php

namespace App\Http\Controllers;

use App\Models\Applicants;
use App\Events\ApplicantStatusUpdated;
use App\Notifications\ApplicantStatusUpdated as ApplicantStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApplicantStatusController extends Controller
{
    public function update(Request $request, $id)
    {
        // Step 1: Validate the request first
        $validatedData = $request->validate([
            'status' => 'required|in:accepted,denied,pending,reviewed'
        ]);

        try {
            // Step 2: Find the applicant with job relationship
            $applicant = Applicants::with('job')->findOrFail($id);
            $oldStatus = $applicant->status;
            
            // Step 3: Update the status
            $applicant->status = $validatedData['status'];
            $applicant->save();

            Log::info('Status update successful', [
                'applicant_id' => $id,
                'old_status' => $oldStatus,
                'new_status' => $validatedData['status']
            ]);

            // Step 4: Send email notification
            $applicant->notify(new ApplicantStatusNotification($applicant, $validatedData['status']));

            // Step 5: Broadcast the event
            event(new ApplicantStatusUpdated($applicant, $validatedData['status']));

            return response()->json([
                'message' => 'Status updated successfully',
                'data' => $applicant
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Applicant not found',
                'error' => $e->getMessage()
            ], 404);
        } catch (\Exception $e) {
            Log::error('Status update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}