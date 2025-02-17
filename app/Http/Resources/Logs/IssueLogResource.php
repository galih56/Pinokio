<?php

namespace App\Http\Resources\Logs;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IssueLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'issue_id' => $this->issue_id,
            'user_id' => $this->user_id,
            'user_type' => $this->user_type ?? 'user',
            'action' => $this->action,
            'action_details' => $this->formatActionDetails(),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format the action details based on action type.
     *
     * @return array<string, mixed>
     */
    protected function formatActionDetails(): array
    {
        $details = json_decode($this->changes, true) ?? [];

        return match ($this->action) {
            'updated' => ['updated_fields' => array_keys($details)],
            'status_change' => [
                'previous_status' => $details['old_status'] ?? '',
                'new_status' => $details['new_status'] ?? ''
            ],
            'created', 'deleted' => ['description' => "Issue {$this->action}"],
            default => []
        };
    }
}
