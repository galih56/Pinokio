<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Helpers\QueryProcessor;

class UserService
{
    protected User $model;

    public function getRelatedData()
    {
        return [
            'role',
        ];
    }

    public function __construct(
        User $model,
    )
    {
        $this->model = $model;
    }

    public function getAllUsers(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);
        $query->with($this->getRelatedData());

        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    public function searchUser(string $keyword){
        $keyword = "%".strtolower($keyword)."%" ; // Add wildcards and convert to lowercase

        return User::whereRaw("LOWER(name) LIKE ?", [$keyword])
                ->orWhereRaw("LOWER(email) LIKE ?", [$keyword])
                ->limit(10)->get();
    }

    public function getUserById(int $id): ?User
    {
        $this->model = User::findOrFail($id);
        return $this->model;
    }

    /**
     * Create a new tag.
     */
    public function create(array $data): User
    {
        $this->model = $this->model->create($data);
        return $this->model;
    }

    /**
     * Update an existing tag.
     */
    public function updateUser(int $id, array $data): User
    {
        $model = $this->model->find($id);
        $model->update($data);
        return $model;
    }

    /**
     * Delete a tag.
     */
    public function deleteUser(int $id): bool
    {
        $model = $this->model->find($id);
        return $model->delete();
    }

    /**
     * Attach a tag to an issue.
     */
    public function attachUserToIssue(int $tagId, int $issueId): void
    {
        DB::table('issue_tag')->insert([
            'tag_id' => $tagId,
            'issue_id' => $issueId
        ]);
    }

    /**
     * Detach a tag from an issue.
     */
    public function detachUserFromIssue(int $tagId, int $issueId): void
    {
        DB::table('issue_tag')
            ->where('tag_id', $tagId)
            ->where('issue_id', $issueId)
            ->delete();
    }
}
