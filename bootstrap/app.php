<?php

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

use App\Http\Middleware\RoleCheck;
use App\Http\Middleware\DecodeHashParameter;
use App\Helpers\ApiResponse;

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
        $exceptions->renderable(function (\Throwable $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                // Model not found
                if (
                    $e instanceof NotFoundHttpException &&
                    $e->getPrevious() instanceof ModelNotFoundException
                ) {
                    $model = class_basename($e->getPrevious()->getModel());
                    $message = match ($model) {
                        'Form' => 'The form you are looking for does not exist.',
                        'Issue' => 'The issue you are looking for does not exist.',
                        'Task' => 'The task you are looking for does not exist.',
                        'Project' => 'The project you are looking for does not exist.',
                        'User' => 'The user you are looking for does not exist.',
                        'UserRole' => 'The user role you are looking for does not exist.',
                        'Team' => 'The team you are looking for does not exist.',
                        'File' => 'The file you are looking for does not exist.',
                        'Comment' => 'The comment you are looking for does not exist.',
                        default => "$model you are looking for does not exist.",
                    };

                    return ApiResponse::sendResponse(null, $message, 'error', 404);
                }

                // Route not found
                if ($e instanceof NotFoundHttpException || $e instanceof RouteNotFoundException) {
                    return ApiResponse::sendResponse(null, 'Requested endpoint not found.', 'error', 404);
                }

                // Validation errors
                if ($e instanceof ValidationException) {
                    return ApiResponse::sendResponse($e->errors(), 'Invalid inputs.', 'error', 422);
                }

                // Authorization error
                if ($e instanceof \Illuminate\Auth\Access\AuthorizationException || $e instanceof AccessDeniedHttpException) {
                    return ApiResponse::sendResponse(null, 'This action is unauthorized.', 'error', 403);
                }

                // Authentication error
                if ($e instanceof AuthenticationException) {
                    return ApiResponse::sendResponse(null, 'Unauthenticated.', 'error', 401);
                }

                // Unexpected client-side value
                if ($e instanceof \UnexpectedValueException) {
                    return ApiResponse::sendResponse(null, 'Unexpected input or parameter.', 'error', 400);
                }

                // Generic error (production)
                $debug = config('app.debug');
                if (!$debug) {
                    \Log::error($e); // Log the error for debugging
                    return ApiResponse::sendResponse(null, 'Internal server error.', 'error', 500);
                }

                // Debug mode: show actual exception message
                return ApiResponse::sendResponse(null, $e->getMessage(), 'error', 500);
            } else {
                // Web exception handlers

                if ($e instanceof AuthenticationException || $e instanceof RouteNotFoundException) {
                    return redirect()->route('auth');
                }

                if ($e instanceof AccessDeniedHttpException) {
                    return response()->view('errors.403', [], 403);
                }

                // Add custom handling for web if needed
            }
        });
    })
    ->create();
