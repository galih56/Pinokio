<?php

namespace App\Services\Forms;

use App\Models\Forms\Form;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Helpers\QueryProcessor;

class FormService
{
    protected Form $model;

    public function getRelatedData()
    {
        return [ 
            'tokens',
            'attempts',
            'templates'
        ];
    }

    public function __construct(
        Form $model,
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
    public function getById(int $id): ?Form
    {
        $this->model = Form::findOrFail($id);
        return $this->model;
    }

    /**
     * Create a new tag.
     */
    public function create(array $data): Form
    {
        $this->model = $this->model->create($data);
        return $this->model;
    }

    /**
     * Update an existing tag.
     */
    public function update(int $id, array $data): Form
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
}
