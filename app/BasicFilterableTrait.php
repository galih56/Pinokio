<?php
namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use App\Helpers\DatetimeHelper;

trait BasicFilterableTrait
{
    /**
     * Scope to apply search, pagination, and eager loading.
     */
    public function scopeFilter(Builder $query, array $search = [], int $perPage = 0, array $sorts = [], array $relations = []): Builder|Collection|LengthAwarePaginator
    {
        $query = $this->applyFilters($query, $search)
                      ->applySorts($query, $sorts)
                      ->applyRelations($query, $relations);

        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    /**
     * Scope to apply search and eager loading, returning only the query.
     */
    public function scopeFilterQuery(Builder $query, array $search = [], array $sorts = [], array $relations = []): Builder
    {
        return $this->applyFilters($query, $search)
                    ->applySorts($query, $sorts)
                    ->applyRelations($query, $relations);
    }

    /**
     * Apply filters to a query.
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        foreach ($filters as $filterGroup) {
            $query->where(function ($q) use ($filterGroup) {
                foreach ($filterGroup as $field => $value) {
                    if (strpos($field, 'with:') === 0) {
                        $this->applyRelatedFilter($q, substr($field, 5), $value);
                    } else {
                        [$column, $operator] = explode(':', $field) + [null, '='];
                        $this->applyCondition($q, $column, $value, 'orWhere', $operator);
                    }
                }
            });
        }
        return $query;
    }

    /**
     * Apply related (hasOne/hasMany) filters.
     */
    protected function applyRelatedFilter(Builder $query, string $field, $value, string $method = 'whereHas'): void
    {
        $segments = explode(':', $field);

        if (count($segments) !== 3) {
            throw new InvalidArgumentException("Invalid format. Use 'with:relation:columns:operator'.");
        }

        [$relation, $columns, $operator] = $segments;
        $columnsArray = explode(',', $columns);

        $query->{$method}($relation, function ($q) use ($columnsArray, $operator, $value) {
            foreach ($columnsArray as $column) {
                $this->applyCondition($q, $column, $value, 'where', $operator);
            }
        });
    }

    /**
     * Apply conditions based on different operators.
     */
    protected function applyCondition(Builder $query, string $field, $value, string $method, string $operator = '='): void
    {
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
                    
                    if ($start && $end) {
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
            case 'not_equal':
            case '!=':
                $query->{$method}($field, '!=', $value);
                break;
            default:
                $query->{$method}($field, $operator, $value);
                break;
        }
    }

    /**
     * Apply sorting to the query.
     */
    protected function applySorts(Builder $query, array $sorts = []): Builder
    {
        foreach ($sorts as $field => $direction) {
            $query->orderBy($field, $direction);
        }
        return $query;
    }

    /**
     * Apply eager loading.
     */
    protected function applyRelations(Builder $query, array $relations): Builder
    {
        foreach ($relations as $key => $relation) {
            if (is_int($key) && is_string($relation)) {
                $query->with($relation);
            } elseif (is_string($key) && $relation instanceof \Closure) {
                $query->with([$key => $relation]);
            }
        }
        return $query;
    }

    /**
     * Count records based on conditions.
     */
    public static function countRecords(array $conditions = []): int
    {
        return static::query()->applyFilters(static::query(), $conditions)->count();
    }
}
