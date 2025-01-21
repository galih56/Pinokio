<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class RegisterRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules() : array
    {
        return[
            'name'=>'required|string|max:255',
            'email'=>'required|string|unique:users,email|max:255',
            'password' => 'string|required_with:password_confirmation|same:password_confirmation',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please provide your name.',
            'email.required' => 'We need to know your e-mail address!',
            'email.email' => 'The e-mail address must be a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.required' => 'A password is required.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password_confirmation.required_with' => 'Please confirm your password.',
            'password_confirmation.same' => 'The password and confirmation password do not match.',
       ];
    }
}
