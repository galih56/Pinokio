<?php

namespace App\Repositories;

use App\Interfaces\IssueRepositoryInterface;
use App\Models\Issue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class IssueRepository extends FilterableRepository implements IssueRepositoryInterface
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
}
