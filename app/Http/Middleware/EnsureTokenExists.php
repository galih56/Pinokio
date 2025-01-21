<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureTokenExists
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Get the authenticated user
        $user = Auth::user();

        if ($user) {
            // Check if the user has no active tokens
            if ($user->tokens()->count() === 0) {
                // Log out the user
                Auth::logout();

                // Redirect to login with an optional message
                return redirect()->route('login')->withErrors([
                    'message' => 'Your session has expired. Please log in again.',
                ]);
            }
        }

        return $next($request);
    }
}
