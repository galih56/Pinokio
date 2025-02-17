<?php

namespace App\Services;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TagService
{
    protected Tag $model;

    public function __construct(Tag $model)
    {
        $this->model = $model;
    }

    public function getAllTags(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        return $this->tagRepository->getAll($filters, $perPage, $sorts);
    }
    public function getTagById(int $id): ?Tag
    {
        $this->model = Tag::findOrFail($id);
        return $this->model;
    }

    /**
     * Create a new tag.
     */
    public function createTag(array $data): Tag
    {
        $this->model = $this->model->create($data);
        return $this->model;
    }

    /**
     * Update an existing tag.
     */
    public function updateTag(int $id, array $data): Tag
    {
        $model = $this->findTag($id);
        $model->update($data);
        return $model;
    }

    /**
     * Delete a tag.
     */
    public function deleteTag(int $id): bool
    {
        $model = $this->findTag($id);
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
