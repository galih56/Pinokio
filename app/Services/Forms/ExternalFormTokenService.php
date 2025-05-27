<?php

namespace App\Services;

use App\Models\Forms\Form;
use App\Models\Forms\FormToken;
use Illuminate\Support\Str;

class ExternalFormTokenService
{
    public function generateToken(Form $form, ?string $identifier = null): string
    {
        $token = Str::random(32);

        FormToken::create([
            'form_id' => $form->id,
            'token' => $token,
            'identifier' => $identifier,
            'expires_at' => now()->addHours(2), // adjust as needed
        ]);

        return route('forms.access', ['token' => $token]); // Adjust route name as needed
    }

    public function triggerOpenTime(string $token): ?FormToken
    {
        $formToken = FormToken::where('token', $token)->firstOrFail();

        if (!$formToken->open_time) {
            $formToken->update(['open_time' => now()]);
        }

        return $formToken;
    }
}
