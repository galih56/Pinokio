<?php
namespace App\Services\Forms;

use App\Models\Forms\Form;
use Illuminate\Support\Str;

class ExternalFormService
{
    public function createForm(array $data): Form
    {
        return Form::create([
            'title' => $data['title'],
            'type' => 'google',
            'form_code' => $data['form_code'],
            'form_url' => $data['form_url'] ?? null,
            'access_type' => $data['access_type'] ?? 'public',
            'identifier_label' => $data['identifier_label'] ?? null,
            'identifier_description' => $data['identifier_description'] ?? null,
            'identifier_type' => $data['identifier_type'] ?? null,
            'time_limit_minutes' => $data['time_limit_minutes'] ?? 0,
            'allow_multiple_attempts' => $data['allow_multiple_attempts'] ?? false,
            'is_active' => true,
        ]);
    }

    public function generateAccessToken(Form $form, ?string $identifier = null): string
    {
        return app(ExternalFormTokenService::class)->generateToken($form, $identifier);
    }
}