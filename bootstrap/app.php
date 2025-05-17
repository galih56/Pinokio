<?php

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\RoleCheck;
use App\Http\Middleware\DecodeHashParameter;
use App\Helpers\ApiResponse;
use Illuminate\Auth\AuthenticationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->group('api', [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        $middleware->statefulApi();
        $middleware->api()->alias([
            'role' => RoleCheck::class,
            'decode_id'=> DecodeHashParameter::class
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle generic exceptions for API requests
        $exceptions->renderable(function (\Throwable $e, $request) {  // Fully qualified Throwable
            if ($request->is('api/*') || $request->expectsJson()) {
                // Handle Model Not Found (404)
                if ($e instanceof ModelNotFoundException) {
                    return ApiResponse::sendResponse(null, $e->getMessage(),'error', 500);
                }

                // Handle Validation Exceptions (422)
                if ($e instanceof ValidationException) {
                    $errors = $e->errors(); 
            
                    return ApiResponse::sendResponse($errors, 'Invalid Inputs', 'error', 422);
                }

                // Handle Authorization Exceptions (403)
                if ($e instanceof \Illuminate\Auth\Access\AuthorizationException || $e instanceof \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException) {
                    return ApiResponse::sendResponse(null, 'This action is unauthorized.','error', 403);
                }

                if ($e instanceof AuthenticationException || $e instanceof \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException) {
                    return ApiResponse::sendResponse(null, $e->getMessage(),'error', 401);
                }
                
                if ($e instanceof \Symfony\Component\Routing\Exception\RouteNotFoundException) {
                    return ApiResponse::sendResponse(null, $e->getMessage(),'error', 404);
                }

                if ($e instanceof \UnexpectedValueException) {
                    return ApiResponse::sendResponse(null, $e->getMessage(),'error', 400);
                    // HTTP 400 for client errors
                }

                $debugMode = config('app.debug');
                if (!$debugMode) {
                    return response()->json([
                        'status' => 'error',
                        'message' => $e->getMessage(),
                    ], 500); // Default to 500 if no specific handling found
                }
            }else{
                
                // Handle Authorization Exceptions (403)
                if ($e instanceof AuthenticationException ) {
                    return redirect()->route('auth');
                }
                
                // Handle Authorization Exceptions (403)
                if ($e instanceof \Symfony\Component\Routing\Exception\RouteNotFoundException) {
                    return redirect()->route('auth');
                }
            }
        });
    })->create();
