<?php

namespace App\Http\Resources\Logs;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\HashIdService;

class IssueLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hashid = new HashIdService();
        $details = json_decode($this->action_details, true) ?? [];
        return [
            'issue_id' => $hashid->encode($this->issue_id),
            'user_id' => $this->user_id,
            'user_type' => $this->user_type ?? 'user',
            'action' => $this->action,
            'action_details' => $details,
            'user' => $this->whenLoaded('user', fn() => ([
                'id' => $hashid->encode($this->user->id), 
                'email' => $this->user->email,
                'name' => $this->user->name,
            ])),    
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
