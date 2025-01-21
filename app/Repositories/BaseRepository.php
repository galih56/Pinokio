<?php

namespace App\Repositories;

use App\Interfaces\RepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class BaseRepository implements RepositoryInterface
{    
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Get records with optional search, pagination, and eager loading.
     *
     * @param array $search An associative array of search to apply to the query.
     * @param int|null $perPage The number of items per page for pagination. If null, no pagination is applied.
     * @param array $sorts An associative array of sorting options to apply to the query.
     * @param array $relations An array of relationships to eager load. Can include closures for custom eager loading.
     *
     * @return Collection|LengthAwarePaginator
     */
    public function get(array $search = [], int $perPage = 0, array $sorts = [], array $relations = []): Collection|LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $query = $this->applyFilters($query, $search);
        $query = $this->applySorts($query, $sorts);

        if (!empty($relations)) {
            $query = $this->applyRelations($query, $relations);
        }

        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    /**
     * Get records with optional search, and eager loading.
     *
     * @param array $search An associative array of search to apply to the query.
     * @param array $sorts An associative array of sorting options to apply to the query.
     * @param array $relations An array of relationships to eager load. Can include closures for custom eager loading.
     *
     * @return Builder
     */
    public function getQuery(array $search = [],  array $sorts = [], array $relations = []): Builder
    {
        $query = $this->model->newQuery();

        $query = $this->applyFilters($query, $search);
        $query = $this->applySorts($query, $sorts);

        if (!empty($relations)) {
            $query = $this->applyRelations($query, $relations);
        }

        return $query;
    }

    public function find(int $id) : ?Model
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data) : Model
    {
        $record = $this->model->findOrFail($id);
        $record->update($data);
        return $record;
    }

    public function delete(int $id) : bool
    {
        $record = $this->model->findOrFail($id);
        return $record->delete();
    }
    public function applyFilters(Builder $query, array $filters): Builder
    {
        foreach ($filters as $filterGroup) {
            $query->where(function ($q) use ($filterGroup) {
                foreach ($filterGroup as $field => $value) {
                    if (strpos($field, 'with:') === 0) {
                        // Handle related filters (relationships)
                        $this->applyRelatedFilter($q, $field, $value, 'whereHas');
                    } else {
                        // Apply OR conditions within the group
                        $this->applyCondition($q, $field, $value, 'orWhere');
                    }
                }
            });
        }
    
        return $query;
    }
    
    protected function applyRelatedFilter(
        Builder $query,
        string $field,
        $value,
        string $method = 'whereHas'
    ): void {
        if (strpos($field, 'with:') === 0) {
            $field = substr($field, 5);
            $segments = explode(':', $field);
            $relation = array_shift($segments);
            $columns = implode(':', $segments);
    
            if (strpos($columns, ':') !== false) {
                $columnOperator = explode(':', $columns);
                $columnsArray = explode(',', $columnOperator[0]);
                $operator = $columnOperator[1] ?? 'like';
            } else {
                $columnsArray = explode(',', $columns);
                $operator = 'like';
            }
            
            $query->{$method}($relation, function ($q) use ($columnsArray, $operator, $value) {
                foreach ($columnsArray as $column) {            
                    $this->applyCondition($q, $column, $value, 'where');
                }
            });
        }
    }

    protected function applyCondition(Builder $query, string $field, $value, string $method): void
    {
        $condition = 'where'; // Default condition
    
        if (strpos($field, ':') !== false) {
            list($field, $condition) = explode(':', $field);
        }
    
        switch ($condition) {
            case 'like':
                $query->{$method}($field, 'like', "%$value%");
                break;
    
            case 'in':
                $query->{$method . 'In'}($field, (array) $value);
                break;
    
            case 'greater_than':
                $query->{$method}($field, '>', $value);
                break;
    
            case 'less_than':
                $query->{$method}($field, '<', $value);
                break;
    
            case 'equal':
                $query->{$method}($field, '=', $value);
                break;
    
            case 'between':
                if (is_array($value) && count($value) === 2) {
                    $query->{$method . 'Between'}($field, $value);
                }
                break;
    
            case 'date':
                $query->{$method}($field, '=', $value);
                break;
    
            default:
                $query->{$method}($field, $value);
                break;
        }
    }

    public function applySorts($query, array $sorts = []) : Builder
    {
        foreach ($sorts as $field => $direction) {
            $query->orderBy($field, $direction);
        }
        return $query;
    }

    /**
     * Apply eager loading of relationships to the query.
     *
     * @param Builder $query
     * @param array $relations
     * @return Builder
     */
    protected function applyRelations(Builder $query, array $relations): Builder
    {
        foreach ($relations as $key => $relation) {
            if (is_int($key) && is_string($relation)) {
                // Handle standard eager loading with relationship names
                $query->with($relation);
            } elseif (is_string($key) && $relation instanceof \Closure) {
                // Handle custom eager loading with closures
                $query->with([$key => $relation]);
            }
        }

        return $query;
    }

    public function count(array $conditions = []) : int
    {
        $query = $this->model->newQuery();
        return $this->applyFilters($query, $conditions)->count();
    }
}
