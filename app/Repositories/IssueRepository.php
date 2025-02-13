<?php

namespace App\Repositories;

use App\Interfaces\IssueRepositoryInterface;
use App\Models\Issue;
use App\Models\Tag;
use App\Models\File;
use App\Services\Logs\IssueLogService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class IssueRepository extends BaseRepository implements IssueRepositoryInterface
{
    protected $issueLogService;

    public function __construct(Issue $model, IssueLogService $issueLogService)
    {
        parent::__construct($model);
        $this->issueLogService = $issueLogService;
    }

    public function getRelatedData()
    {
        return [
            'tags',
            'files',
            'issuer',
        ];
    }

    /**
     * Create a new issue and log the action.
     */
    public function create(array $data): Issue
    {
        $this->model = $this->model->create($data);

        $this->issueLogService->create([
            'issue_id' => $this->model->id,
            'user_id' => $data['issuer_id'],
            'user_type' => $data['issuer_type'],
            'action' => 'created',
            'action_details' => json_encode(['description' => 'Issue created']),
        ]);

        return $this->model;
    }

    /**
     * Update an existing issue and log the action.
     */
    public function update(int $id, array $data): Issue
    {
        $this->model = $this->model->find($id);
        $this->model->update($data);

        // Log the update action
        $this->issueLogService->create([
            'issue_id' => $this->model->id,
            'user_id' => isset($data['user_id']) ? $data['user_id'] : null,
            'action' => 'updated',
            'action_details' => json_encode(['updated_fields' => array_keys($data)]),
        ]);

        return $this->model;
    }

    /**
     * Close an issue.
     */
    public function updateStatus(int $id, array $data) : Issue
    {
        $this->model = $this->model->find($id);
        
        $this->model->status = $data['status'];
        $this->model->save();
        $this->issueLogService->create([
            'issue_id' => $this->model->id,
            'user_id' => auth()->id(),
            'user_type' => $data['issuer_type'],
            'action' => 'status_change',
            'action_details' => json_encode(['previous_status' =>  $this->model->getOriginal('status'), 'new_status' => 'closed']),
        ]);

        return $this->model;
    }
    
    /**
     * Close a public issue.
     */
    public function closePublicIssue(int $id, array $data) : Issue
    {
        $this->model = $this->model->find($id);
        
        $this->model->status = 'closed';
        $this->model->save();

        $this->issueLogService->create([
            'issue_id' => $this->model->id,
            'user_id' => $data['user_id'],
            'user_type' => $data['issuer_type'],
            'action' => 'status_change',
            'action_details' => json_encode(['previous_status' =>  $this->model->getOriginal('status'), 'new_status' => 'closed']),
        ]);

        return $this->model;
    }
    /**
     * Delete an issue and log the action.
     */
    public function delete(int $id): bool
    {
        $this->model = $this->find($id);
        if (!$this->model) {
            throw new Exception("Issue not found.");
        }

        $this->model->tags()->detach();

        // Log the deletion action
        $this->issueLogService->create([
            'issue_id' => $this->model->id,
            'user_id' => auth()->id(),  // Assuming the authenticated user is deleting
            'action' => 'deleted',
            'action_details' => json_encode(['description' => 'Issue deleted']),
        ]);

        return $this->model->delete();
    }

    /**
     * Get all issues with the given filters, pagination, and sorting.
     */
    public function getAll(array $filters = [], int $perPage = 0, array $sorts = [], array $relations = []): Collection | LengthAwarePaginator
    {
        return parent::get($filters, $perPage, $sorts, $this->getRelatedData());
    }

    /**
     * Get issue by ID with related data.
     */
    public function getById(int $id): ?Issue
    {
        return $this->model->with($this->getRelatedData())->find($id);
    }

    /**
     * Attach tags to an issue.
     */
    public function attachTags(int $id, array $tagIds): void
    {
        $this->model = $this->model->find($id);
        $tags = Tag::find($tagIds);
        $this->model->tags()->attach($tags);
    }

    /**
     * Attach files to an issue.
     */
    public function attachFiles(int $id, $files): void
    {
        $this->model = $this->model->with('files')->find($id);
        if (!is_array($files)) {
            $files = [$files];
        }
        foreach ($files as $file) {
            // Ensure $file is a File model, and attach the file ID to the issue
            if ($file instanceof File) {
                $this->model->files()->attach($file->id); // Attach the file's ID
            }
        }
    }
}
