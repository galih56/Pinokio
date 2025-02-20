<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\DatetimeHelper;

class QueryProcessor
{
    public static function applyFilters(Builder $query, array $filters): Builder
    {
        foreach ($filters as $filterGroup) {
            $query->where(function ($q) use ($filterGroup) {
                foreach ($filterGroup as $field => $value) {
                    if (strpos($field, 'with:') === 0) {
                        self::applyRelatedFilter($q, $field, $value, 'orWhereHas');
                    } else {
                        $segments = explode(':', $field);
                        $table_name = $segments[0];
                        $columns = explode(',', $segments[1]); // Columns to compare (e.g., 'name,description')
                        $operator = $segments[2] ?? '='; // Default operator '='

                        foreach ($columns as $column) {
                            self::applyCondition($q, 'orWhere',$column, $value,  $operator);
                        }
                    }
                }
            });
        }

        return $query;
    }

    public static function applySorts(Builder $query, array $sorts = []): Builder
    {
        foreach ($sorts as $field => $direction) {
            $query->orderBy($field, $direction);
        }
        return $query;
    }

    public static function applyRelatedFilter(Builder $query, string $field, $value, string $method = 'whereHas'): void
    {
        $field = substr($field, 5);
        $segments = explode(':', $field);

        if (count($segments) === 3) {
            [$relation, $columns, $operator] = $segments;
            $columnsArray = explode(',', $columns);

            $query->{$method}($relation, function ($q) use ($columnsArray, $operator, $value) {
                foreach ($columnsArray as $column) {
                    self::applyCondition($q, 'where', $column, $value, $operator);
                }
            });
        } else {
            throw new \InvalidArgumentException("Invalid field format. Expected 'with:relation:columns:operator'.");
        }
    }

    public static function applyCondition(Builder $query, string $method, string $field, $value, string $operator = '='): void
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
}
