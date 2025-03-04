<?php 
namespace App\Services;

use App\Models\GuestIssuer;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class GuestIssuerService
{    
    public function getOrCreateGuestIssuer(string $email, string $name, string $ip): GuestIssuer
    {
        $guestIssuer = GuestIssuer::firstOrCreate(
            ['email' => $email], 
            [
                'name' => $name,
                'ip_address' => $ip
            ]   
        );

        return $guestIssuer;
    }
    
    public function getById(int $id){
        $guestIssuer = GuestIssuer::find($id);
        return $guestIssuer;
    }

    public function getByEmail(string $email) : GuestIssuer | null {
        $guestIssuer = GuestIssuer::where('email',$email)->first();
        return $guestIssuer;
    }
}