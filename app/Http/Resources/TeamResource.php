<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\HashIdService;

class TeamResource extends JsonResource
{
    protected HashIdService $hashid;

    public function __construct($resource)
    {
        parent::__construct($resource);
        $this->hashid = new HashIdService(); // Avoid redundant instantiations
    }

    public function toArray(Request $request): array
    {
        $hashid = new HashIdService();
    
        return [
            'id' => $hashid->encode($this->id), 
            'code' => $this->code,
            'name' => $this->name,
            'color' => $this->color,
            'description' => $this->description,
            'assignments' => $this->whenLoaded('assignments', fn() => 
                $this->assignments->map(fn($assignment) => [
                    'id' => $hashid->encode($assignment->id),
                    'type' => class_basename($assignment->assignable), 
                    'data' => $this->getAssignmentData($assignment->assignable), 
                ])
            ),
            'members' => $this->whenLoaded('members', 
                fn() => $this->members->map(fn($member) => [
                    'id' => $hashid->encode($member->id),
                    'name' => $member->name,
                    'username' => $member->username,
                    'role' => $this->whenLoaded('role', fn() => [
                        'id' => $hashid->encode($this->role->id), 
                        'code' => $this->role->code,
                        'name' => $this->role->name,
                    ]),
                ])
            ),
            'creator' => $this->whenLoaded('creator', fn() => [
                'id' => $this->hashid->encode($this->creator->id),
                'email' => $this->creator->email,
                'name' => $this->creator->name,
                'username' => $this->creator->username,
            ]),
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
        ];
    }
    
    /**
     * Get assignment-specific data based on the type.
     */
    private function getAssignmentData($assignable): array
    {
        if (!$assignable) {
            return [];
        }
    
        return match (class_basename($assignable)) {
            'Issue' => [
                'title' => $assignable->title,
                'status' => $assignable->status,
                'priority' => $assignable->priority,
            ],
            'Task' => [
                'title' => $assignable->title,
                'due_date' => $assignable->due_date,
                'completed' => $assignable->completed,
            ],
            'Project' => [
                'name' => $assignable->name,
                'deadline' => $assignable->deadline,
                'manager' => $assignable->manager->name ?? null,
            ],
            default => [],
        };
    }
    

}
