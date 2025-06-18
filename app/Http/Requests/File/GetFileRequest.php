<?php


namespace App\Http\Requests;

use App\Http\Requests\BaseRequest;

class GetFileRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Allow any user to fetch files, you can add authorization logic here if needed
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'related_type' => 'nullable|string|in:task,project,issue', // Validate the related_type
            'related_id'   => 'nullable|integer|exists:tasks,id,projects,id,issues,id', // Validate related_id based on provided related_type
        ];
    }

    /**
     * Map the related type (e.g., 'task', 'project', 'issue') to the full class name.
     */
    public function getRelatedTypeClass(): ?string
    {
        $mapping = [
            'task' => \App\Models\Task::class,
            'project' => \App\Models\Project::class,
            'issue' => \App\Models\Issue::class,
        ];

        // Check if the related_type is valid and return the mapped class name
        return $this->has('related_type') && array_key_exists($this->related_type, $mapping)
            ? $mapping[$this->related_type]
            : null;
    }
}
