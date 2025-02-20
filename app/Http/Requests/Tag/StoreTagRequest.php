<?php

namespace App\Http\Requests\Tag;

use Illuminate\Foundation\Http\FormRequest;

class StoreTagRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'], // Validates hex color
            'isPublic' => ['boolean'],
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Tag name is required.',
            'color.regex' => 'Invalid color format. Please use a valid HEX color code.',
            'isPublic.boolean' => 'Invalid value for public availability.',
        ];
    }
}
