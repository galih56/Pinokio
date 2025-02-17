<?php

namespace App\Repositories;

use App\Interfaces\FilterableRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Helpers\DatetimeHelper;

class FilterableRepository implements FilterableRepositoryInterface
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

    public function applyFilters(Builder $query, array $filters): Builder
    {
        foreach ($filters as $filterGroup) {
            $query->where(function ($q) use ($filterGroup) {
                foreach ($filterGroup as $field => $value) {
                    if (strpos($field, 'with:') === 0) {
                        // Handle related filters (relationships)
                        $this->applyRelatedFilter($q, $field, $value, 'orWhereHas');
                    } else {
                        $segments = explode(':', $field);
                        $columns = explode(',',$segments[0]); // Columns to compare (e.g., 'name,description')
                        $operator = $segments[1]; // Operator (e.g., 'like', '=')
                        
                        foreach ($columns as $key => $column) {
                            // Apply OR conditions within the group
                            $this->applyCondition($q, $column, $value, 'orWhere', $operator);
                        }
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
        // Remove the 'with:' prefix
        $field = substr($field, 5);
        
        // Split the field into segments
        $segments = explode(':', $field);
        // Ensure there are exactly 3 segments (related table, columns, operator)
        if (count($segments) === 3) {
            $relation = $segments[0]; // Related table (e.g., 'tags')
            $columns = $segments[1]; // Columns to compare (e.g., 'name,description')
            $operator = $segments[2]; // Operator (e.g., 'like', '=')
            
            // Split the columns into an array
            $columnsArray = explode(',', $columns);
            
            // Apply the conditions to the query
            $query->{$method}($relation, function ($q) use ($columnsArray, $operator, $value) {
                foreach ($columnsArray as $column) {
                    // Pass 'where' as the method and the operator separately
                    $this->applyCondition($q, $column, $value, 'where', $operator);
                }
            });
        } else {
            // Handle invalid segment count (optional: log or throw an exception)
            throw new \InvalidArgumentException("Invalid field format. Expected 'with:relation:columns:operator'.");
        }
    }
    
    protected function applyCondition(
        Builder $query,
        string $field,
        $value,
        string $method, // The condition method (e.g., 'where', 'orWhere')
        string $operator = '=' // The operator (e.g., 'like', '=', '>')
    ): void {
        switch ($operator) {
            case 'like':
                $query->{$method}(DB::raw("LOWER($field)"), 'like', "%".strtolower($value)."%");
                break;
    
            case 'in':
                $query->{$method . 'In'}($field, (array) $value);
                break;
    
            case 'between':
                if (is_array($value) && count($value) === 2) {
                    $query->{$method . 'Between'}($field, $value);
                }
                break;
    
            case 'date_between':
                if (is_array($value) && count($value) === 2) {
                            
                    $start = DatetimeHelper::createDateTimeObject($value[0]);
                    $end = DatetimeHelper::createDateTimeObject($value[1]);
                    if($start && $end){
                        $query->whereBetween($field, [
                            $start->startOfDay(),
                            $end->endOfDay(),
                        ]);
                    }
                }
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
            case 'not_equal':
            case '!=':
                $query->{$method}($field, '!=', $value);
                break;
    
            case 'date':
                $query->{$method}($field, '=', $value);
                break;
    
            default:
                $query->{$method}($field, $operator, $value);
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
