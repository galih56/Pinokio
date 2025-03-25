<?php
namespace App\Http\Resources;

use App\Services\HashIdService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    protected HashIdService $hashid;
    protected int $depth;
    protected int $maxDepth;

    public function __construct($resource, $depth = 0, $maxDepth = 2)
    {
        parent::__construct($resource);
        $this->hashid = new HashIdService();
        $this->depth = $depth;
        $this->maxDepth = $maxDepth;
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

            'created_by' => $this->whenLoaded('created_by', fn() => [
                'id' => $this->hashid->encode($this->created_by->id),
                'email' => $this->created_by->email,
                'name' => $this->created_by->name,
            ]),

            'tags' => $this->whenLoaded('tags', fn() => $this->tags->map(fn($tag) => [
                'id' => $this->hashid->encode($tag->id),
                'name' => $tag->name,
                'color' => $tag->color,
            ])),

            // Load child tasks only if depth is within limit
            'tasks' => $this->when($this->depth < $this->maxDepth, function () {
                return TaskResource::collection(
                    $this->whenLoaded('children', fn() => 
                        $this->children->map(fn($task) => new TaskResource($task, $this->depth + 1, $this->maxDepth))
                    )
                );
            }),

            'issue' => $this->whenLoaded('issue', fn() => new IssueResource($this->issue)),
            'project' => $this->whenLoaded('project', fn() => new ProjectResource($this->project)),

            'description' => $this->description,
            'due_date' => $this->due_date,
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,

            // Comments only show the last 3 unread comments
            'unread_comments_count' => $this->unread_comments_count,
            'latest_unread_comments' => $this->whenLoaded('comments', function () {
                return $this->comments->take(3)->map(fn($comment) => [
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
