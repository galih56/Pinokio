<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class EnumRule implements Rule
{
    private string $enumClass;
    private ?string $customMessage;

    public function __construct(string $enumClass, string $customMessage = null)
    {
        $this->enumClass = $enumClass;
        $this->customMessage = $customMessage;
    }

    public function passes($attribute, $value): bool
    {
        return in_array($value, array_column($this->enumClass::cases(), 'value'), true);
    }

    public function message(): string
    {
        return $this->customMessage ?? 'The :attribute field must be a valid value from the enum.';
    }
}
