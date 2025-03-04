<?php

namespace App\Http\Requests\Comment;

use Illuminate\Foundation\Http\FormRequest;

use App\Http\Requests\BaseRequest;

class MarkCommentAsReadRequest extends BaseRequest
{
    public function authorize()
    {
        return true; 
    }

    public function rules()
    {
        return [
            'comment_id' => ['required', 'exists:comments,id'],
            'email' => ['nullable', 'email', 'exists:guest_issuers,email'], 
        ];
    }

    public function getReaderData()
    {
        if ($this->user()) {
            // If authenticated, return user info
            return [
                'reader_id' => $this->user()->id,
                'reader_type' => 'user',
            ];
        }

        if ($this->has('email')) {
            // If not authenticated, use guest issuer info
            $guestIssuer = \App\Models\GuestIssuer::where('email', $this->email)->first();

            if ($guestIssuer) {
                return [
                    'reader_id' => $guestIssuer->id,
                    'reader_type' => 'guest_issuer',
                ];
            }
        }

        return null; // No valid reader info
    }
}
