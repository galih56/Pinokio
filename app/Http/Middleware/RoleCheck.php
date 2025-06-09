<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$role
     * @return \Symfony\Component\HttpFoundation\Response
     * 
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function handle(Request $request, Closure $next, ...$role): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            // User is not logged in - 401 Unauthorized
            if ($request->expectsJson() || $request->ajax() || $request->wantsJson()) {
                throw new AuthenticationException('Unauthenticated. Please login.');
            }
            return redirect('/auth/login');
        }
        
        // User is authenticated but checking for role
        if (Auth::user()->hasRole($role)) {
            return $next($request);
        }
        
        // User doesn't have the required role - 403 Forbidden
        if ($request->expectsJson() || $request->ajax() || $request->wantsJson()) {
            throw new AuthorizationException();
        }
        
        // For web requests, redirect to a forbidden page or dashboard
        return redirect()->route('forbidden')->with('message', 'You do not have permission to access this resource.');
    }
}