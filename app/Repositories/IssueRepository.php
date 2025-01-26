<?php

namespace App\Repositories;

use App\Interfaces\IssueRepositoryInterface;
use App\Models\Issue;
use App\Models\Tag;
use App\Models\File;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class IssueRepository extends BaseRepository implements IssueRepositoryInterface
{
    public function __construct(Issue $model)
    {
        parent::__construct($model);
    }

    public function getRelatedData()
    {
        return [
            'tags' ,
            'files' ,
            'issuer'
        ];
    }

    public function create(array $data): Issue
    {
        $issue = $this->model->create($data);

        return $issue;
    }

    public function update(int $id, array $data): Issue
    {
        $issue = $this->find($id);

        $issue->update($data);

        return $issue;
    }

    public function delete(int $id): bool
    {
        $issue = $this->find($id);
        if (!$issue) {
            throw new \Exception("Issue not found.");
        }

        // Detach any tags before deleting
        $issue->tags()->detach();

        return $issue->delete();
    }

    public function getAll(array $filters = [], int $perPage = 0, array $sorts = [], array $relations = []): Collection | LengthAwarePaginator
    {
        return parent::get($filters, $perPage, $sorts, $this->getRelatedData());
    }

    public function getPublicIssues(array $filters = [], int $perPage = 0, array $sorts = [], array $relations = []): Collection | LengthAwarePaginator
    {
        return parent::get($filters, $perPage, $sorts, $this->getRelatedData());
    }

    public function getById(int $id): ?Issue
    {
        return $this->model->with($this->getRelatedData())->find($id);
    }

    public function attachTags(Issue $issue, array $tagIds): void
    {
        $tags = Tag::find($tagIds);
        $issue->tags()->attach($tags);
    }
}
