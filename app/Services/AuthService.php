<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function authenticate($usernameOrEmail, $password, $remember, $ip)
    {
        $loginType = filter_var($usernameOrEmail, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $credentials = [$loginType => $usernameOrEmail, 'password' => $password];
    
        if (Auth::attempt($credentials, $remember)) {
            return Auth::user()->load(['role']);
        }
        return null;
    }

    public function register($data)
    {
        
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'username' => $data['username'],
            'password' => Hash::make($data['password']),
        ]);

        return ['status' => 'success', 'user' => $user];
    }
}
