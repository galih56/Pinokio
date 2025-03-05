<?php

namespace App\Http\Requests\Comment;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Requests\BaseRequest;

class MarkCommentAsReadRequest extends BaseRequest
{
    public function authorize() : bool
    {
        return auth()->check(); // Only allow authenticated users
    }

    public function rules() : array
    {
        return [
            'comment_id' => ['required', 'exists:comments,id'],
        ];
    }

    public function getReaderData()
    {
        return [
            'user_id' => auth()->id(),
        ];
    }
}
