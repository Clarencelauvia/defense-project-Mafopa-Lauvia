<?php

use Illuminate\Support\Facades\Route;
use Illuminate\App\Http\Controllers\AutheController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// // Forgot Password Route
// Route::post('/sendResetLinkEmail', [AutheController::class, 'sendResetLinkEmail'])
//     ->name('password.email');

// // Reset Password Route
// Route::post('/resetPassword', [AutheController::class, 'resetPassword'])
//     ->name('password.update');

require __DIR__.'/auth.php';

// routes/web.php
Route::post('/test-upload', function(Request $request) {
    $path = $request->file('file')->store('test', 'public');
    return response()->json([
        'path' => $path,
        'url' => asset('storage/'.$path)
    ]);
});