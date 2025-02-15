<?php

namespace App\Repositories;

use App\Interfaces\IssueRepositoryInterface;
use App\Models\Issue;
use App\Models\Tag;
use App\Models\File;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class IssueRepository extends BaseRepository implements IssueRepositoryInterface
{
    public function __construct(Issue $model)
    {
        parent::__construct($model);
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

        return $this->model;
    }

    /**
     * Update an existing issue and log the action.
     */
    public function update(int $id, array $data): Issue
    {
        $this->model = $this->model->find($id);
        $this->model->update($data);

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
        return $this->model->with($this->getRelatedData())->findOrFail($id);
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
