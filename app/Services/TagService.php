<?php

namespace App\Services;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Helpers\QueryProcessor;

class TagService
{
    protected Tag $model;

    public function getRelatedData()
    {
        return [
            'issues',
        ];
    }

    public function __construct(
        Tag $model,
    )
    {
        $this->model = $model;
    }

    public function get(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);

        return $perPage ? $query->paginate($perPage) : $query->get();
    }
    public function getById(int $id): ?Tag
    {
        $this->model = Tag::findOrFail($id);
        return $this->model;
    }

    /**
     * Create a new tag.
     */
    public function create(array $data): Tag
    {
        $this->model = $this->model->create($data);
        return $this->model;
    }

    /**
     * Update an existing tag.
     */
    public function update(int $id, array $data): Tag
    {
        $model = $this->model->find($id);
        $model->update($data);
        return $model;
    }

    /**
     * Delete a tag.
     */
    public function delete(int $id): bool
    {
        $model = $this->model->find($id);
        return $model->delete();
    }

    /**
     * Attach a tag to an issue.
     */
    public function attachTagToIssue(int $tagId, int $issueId): void
    {
        DB::table('issue_tag')->insert([
            'tag_id' => $tagId,
            'issue_id' => $issueId
        ]);
    }

    /**
     * Detach a tag from an issue.
     */
    public function detachTagFromIssue(int $tagId, int $issueId): void
    {
        DB::table('issue_tag')
            ->where('tag_id', $tagId)
            ->where('issue_id', $issueId)
            ->delete();
    }
}
