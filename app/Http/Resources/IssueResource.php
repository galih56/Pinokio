<?php


namespace App\Http\Resources;

use App\Services\HashIdService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IssueResource extends JsonResource
{
    protected HashIdService $hashid;

    public function __construct($resource)
    {
        parent::__construct($resource);
        $this->hashid = new HashIdService(); // Avoid redundant instantiations
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->hashid->encode($this->id),
            'title' => $this->title,
            'status' => $this->status,
            'issuer' => $this->whenLoaded('issuer', fn() => [
                'id' => $this->hashid->encode($this->issuer->id),
                'email' => $this->issuer->email,
                'name' => $this->issuer->name,
            ]),
            'tags' => $this->whenLoaded('tags', fn() => $this->tags->map(fn($tag) => [
                'id' => $this->hashid->encode($tag->id),
                'name' => $tag->name,
                'color' => $tag->color,
            ])),
            'description' => $this->description,
            'due_date' => $this->due_date,
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,

            'unread_comments' => $this->whenLoaded('comments', function () {
                return $this->comments->map(fn($comment) => [
                    'id' => $this->hashid->encode($comment->id),
                    'comment' => $comment->comment,
                    'commenter' => [
                        'id' => $this->hashid->encode($comment->commenter->id),
                        'name' => $comment->commenter->name ?? 'Unknown',
                    ],
                    'created_at' => $comment->created_at,
                ]);
            }),
        ];
    }
}
