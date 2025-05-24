<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->authenticate(
            $request->input('username_or_email'),
            $request->input('password'),
            $request->boolean('remember'),
            $request->ip()
        );

        if (empty($user)) {
            throw new AuthenticationException('Unauthenticated.');
        }

        $token = $user->createToken(env('APP_NAME'))->plainTextToken;

        $user = $user->load(['role']);

        $response = [
            'status' => 'success',
            'message' => 'Login successful',
            'data' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer'
        ];
        return response()->json($response, 200);
    }
    public function me(Request $request)
    {
        $user = Auth::user();
    
        if (empty($user)) {
            return response()->json([
                'status' => 'error',
                'message' => "Unauthenticated",
            ], 401);
        }
    
        $user->load(['role']);
    
        $latestToken = $user->tokens()->latest()->first();

        if(empty($latestToken))
        {
            Auth::logout();
            return response()->json([
                'status' => 'error',
                'message' => "Unauthenticated",
            ], 401);
        }

        $user->makeHidden(['tokens']);
    
        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user),
            'access_token' => $latestToken?->token ?? null,
            'token_type' => $latestToken ? 'Bearer' : null,
        ]);
    }
    

    public function register(RegisterRequest $request)
    {
        $data = $request->all();

        $result = $this->authService->register($data);
        if ($result['status'] === 'error') {
            return response()->json([
                'status' => 'error',
                'message' => $result['message']
            ], (isset($result['http_status_code']) ? $result['http_status_code'] : 422));
        }

        $user = $result['user']->load(['role']);
        $token = $user->createToken(env('APP_NAME'))->plainTextToken;
        return response()->json([
            'status' => 'success',
            'message' => 'Register success',
            'data' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function logout()
    {
        Auth::user()->tokens()->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Logout success'
        ]);
    }
}
