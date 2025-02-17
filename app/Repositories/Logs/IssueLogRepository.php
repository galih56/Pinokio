<?php

namespace App\Repositories\Logs;

use App\Interfaces\Logs\IssueLogRepositoryInterface;
use App\repositories\FilterableRepository;
use App\Models\Logs\IssueLog;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class IssueLogRepository extends FilterableRepository implements IssueLogRepositoryInterface
{
    public function __construct(IssueLog $model)
    {
        parent::__construct($model);
    }


    public function getRelatedData()
    {
        return [
            'issue',
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
    public function getById(int $id): ?IssueLog
    {
        return $this->model->with($this->getRelatedData())->findOrFail($id);
    }
}
