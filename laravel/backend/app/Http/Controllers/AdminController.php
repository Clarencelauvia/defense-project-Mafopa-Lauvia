<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin; // We'll need to create this model
use Illuminate\Support\Facades\Password;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
//  Admin credidential
        $adminEmail = 'lauviamafopa697@gmail.com';
        $adminPassword = 'lauviamafopa@123'; 

        if ($request->email !== $adminEmail || !Hash::check($request->password, Hash::make($adminPassword))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Create or get admin user
        $admin = Admin::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Admin',
                'password' => Hash::make($adminPassword),
            ]
        );

        $token = $admin->createToken('admin_token')->plainTextToken;

        return response()->json([
            'message' => 'Admin login successful!',
            'admin' => [
                'name' => 'Admin',
                'email' => $admin->email,
            ],
            'token' => $token,
            'redirect' => '/admin/dashboard',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out',
        ]);
    }






  


      
    
        public function sendResetLinkEmail(Request $request)
        {
            $request->validate(['email' => 'required|email']);
    
            // Get admin email from .env
            $adminEmail = env('ADMIN_EMAIL', 'lauviamafopa697@gmail.com');
            
            // Check if the email matches the admin email
            if ($request->email !== $adminEmail) {
                return response()->json(['message' => 'Admin not found.'], 404);
            }
    
            // Generate a default password: admin + 5 random numbers
            $defaultPassword = 'admin' . rand(10000, 99999);
    
            // Update the admin's password in the database
            $admin = Admin::where('email', $adminEmail)->firstOrFail();
            $admin->password = Hash::make($defaultPassword);
            $admin->save();
    
            // Send the default password to the admin's email
            Mail::to($adminEmail)->send(new AdminPasswordReset($defaultPassword));
    
            return response()->json([
                'message' => 'A default password has been sent to your email.',
            ]);
        }
    
       
   

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $admin = Admin::where('email', $request->email)->first();
        if (!$admin) {
            return response()->json(['message' => 'Admin not found.'], 404);
        }

        $admin->password = Hash::make($request->password);
        $admin->save();

        return response()->json([
            'message' => 'Password reset successfully.',
        ]);
    }
}
