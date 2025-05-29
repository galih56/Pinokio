<?php

namespace App\Http\Requests\Form;

use App\Services\HashidService;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class StoreFormRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
        ];
    }
}
