<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\HashIdService;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hashid = new HashIdService();

        return [
            'id' => $hashid->encode($this->id), 
            'comment' => $this->comment,
            'commenter_id' => $hashid->encode($this->commenter_id), 
            'commenter_type' => class_basename($this->commenter_type),
            'commentable_id' => $hashid->encode($this->commentable_id), 
            'commentable_type' => class_basename($this->commentable_type),
            'commenter' => $this->whenLoaded('commenter', function () use ($hashid) {
                $commenter_type = class_basename($this->commenter);
                if($commenter_type == 'User') $commenter_type = 'user';
                else if($commenter_type == 'GuestIssuer') $commenter_type = 'guest_issuer';

                return [
                    'id' => $hashid->encode($this->commenter->id), 
                    'email' => $this->commenter->email,
                    'name' => $this->commenter->name,
                    'type' => $commenter_type,
                    'role' => $this->when($this->commenter instanceof \App\Models\User, function () {
                        return [
                            'id' => $this->commenter->role->id ?? null,
                            'name' => $this->commenter->role->name ?? null,
                            'code' => $this->commenter->role->code ?? null,
                        ];
                    }),
                ];
            }),
            'commentable' => $this->whenLoaded('commentable', function () use ($hashid) {
                return [
                    'id' => $hashid->encode($this->commentable->id), 
                    'title' => $this->commentable->title,
                    'description' => $this->commentable->description,
                ];
            }),
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
        ];
    }
}
