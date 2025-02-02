<?php 
namespace App\Services;

use App\Models\GuestIssuer;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class GuestIssuerService
{    
    public function getOrCreateGuestIssuer(string $email, string $name, string $ip): GuestIssuer
    {
        // Check if the guest issuer with this email already exists
        $guestIssuer = GuestIssuer::firstOrCreate(
            ['email' => $email], // Check by email
            [
                'name' => $name,
                'ip_address' => $ip
            ]   
        );

        return $guestIssuer;
    }
}