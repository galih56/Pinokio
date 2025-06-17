<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\DatetimeHelper;

/**
 * QueryProcessor Helper Class
 * 
 * A utility class for dynamically applying filters, sorts, and relationship loading
 * to Eloquent query builders. Supports complex filtering with multiple operators,
 * relationship filtering, and recursive child loading with depth control.
 * 
 * @package App\Helpers
 */
class QueryProcessor
{
    public static function applyGlobalSearch(Builder $query, string $searchTerm, array $searchFields): Builder
    {
        $query->where(function($q) use ($searchTerm, $searchFields) {
            foreach ($searchFields as $field) {
                if (strpos($field, 'with:') === 0) {
                    self::applyRelatedFilter($q, $field, $searchTerm, 'orWhereHas');
                } else {
                    $segments = explode(':', $field);
                    if (count($segments) >= 2) {
                        $columns = explode(',', $segments[1]);
                        $operator = $segments[2] ?? 'like';
                        foreach ($columns as $column) {
                            self::applyCondition($q, 'orWhere', $column, $searchTerm, $operator);
                        }
                    }
                }
            }
        });
        
        return $query;
    }

    /**
     * Apply dynamic filters to a query builder with support for relationships and children depth loading.
     * 
     * @param Builder $query The Eloquent query builder instance
     * @param array $filters Array of filter groups. Each group contains field-value pairs.
     * @param int $childrenDepth Maximum depth for recursive children loading (default: 1)
     * @return Builder The modified query builder
     * 
     * @example Basic Usage:
     * ```php
     * $query = User::query();
     * $filters = [
     *     [
     *         'users:name,email:like' => 'john',
     *         'users:age:greater_than' => 18,
     *         'users:status:in' => ['active', 'pending']
     *     ]
     * ];
     * $result = QueryProcessor::applyFilters($query, $filters);
     * ```
     * 
     * @example Relationship Filtering:
     * ```php
     * $filters = [
     *     [
     *         'with:posts:title:like' => 'Laravel',
     *         'with:profile:city:equal' => 'New York'
     *     ]
     * ];
     * ```
     * 
     * @example Children Depth Loading:
     * ```php
     * $filters = [
     *     [
     *         'with:children' => true  // Loads children with specified depth
     *     ]
     * ];
     * QueryProcessor::applyFilters($query, $filters, 3); // Load 3 levels deep
     * ```
     * 
     * Filter Format Rules:
     * - Basic: 'table:column1,column2:operator' => value
     * - Relationship: 'with:relation:column:operator' => value
     * - Children: 'with:children' => true (uses childrenDepth parameter)
     * - Multiple columns are OR conditions within the same filter
     * - Multiple filter groups are AND conditions
     */
    public static function applyFilters(Builder $query, array $filters, int $childrenDepth = 1): Builder
    {
        foreach ($filters as $filterGroup) {
            $query->where(function ($q) use ($filterGroup, $childrenDepth) {
                foreach ($filterGroup as $field => $value) {
                    if (strpos($field, 'with:') === 0) {
                        if (strpos($field, 'with:children') === 0) {
                            // Apply children depth loading
                            $q->with(['childrenWithDepth' => fn($childQuery) => $childQuery->childrenWithDepth($childrenDepth)]);
                        } else {
                            self::applyRelatedFilter($q, $field, $value, 'orWhereHas');
                        }
                    } else {
                        // Normal filtering
                        $segments = explode(':', $field);
                        $table_name = $segments[0];
                        $columns = explode(',', $segments[1]); 
                        $operator = $segments[2] ?? '=';
    
                        foreach ($columns as $column) {
                            self::applyCondition($q, 'orWhere', $column, $value, $operator);
                        }
                    }
                }
            });
        }
    
        return $query;
    }
    
    /**
     * Apply sorting to the query builder.
     * 
     * @param Builder $query The Eloquent query builder instance
     * @param array $sorts Associative array of field => direction pairs
     * @return Builder The modified query builder
     * 
     * @example Usage:
     * ```php
     * $sorts = [
     *     'created_at' => 'desc',
     *     'name' => 'asc',
     *     'priority' => 'desc'
     * ];
     * $result = QueryProcessor::applySorts($query, $sorts);
     * ```
     */
    public static function applySorts(Builder $query, array $sorts = []): Builder
    {
        foreach ($sorts as $field => $direction) {
            $query->orderBy($field, $direction);
        }
        return $query;
    }

    /**
     * Apply filtering on related models using whereHas or orWhereHas.
     * 
     * @param Builder $query The query builder instance
     * @param string $field The field string in format 'relation:columns:operator'
     * @param mixed $value The value to filter by
     * @param string $method The method to use ('whereHas' or 'orWhereHas')
     * @return void
     * @throws \InvalidArgumentException When field format is invalid
     * 
     * @example Usage:
     * ```php
     * // Filter users who have posts with 'Laravel' in title
     * QueryProcessor::applyRelatedFilter($query, 'posts:title:like', 'Laravel', 'whereHas');
     * 
     * // Filter users who have comments with specific status
     * QueryProcessor::applyRelatedFilter($query, 'comments:status:equal', 'published', 'orWhereHas');
     * ```
     * 
     * Field Format: 'relation:column1,column2:operator'
     * - relation: The relationship method name
     * - columns: Comma-separated column names (OR condition between columns)
     * - operator: Any supported operator (like, equal, in, etc.)
     */
    public static function applyRelatedFilter(Builder $query, string $field, $value, string $method = 'whereHas'): void
    {
        $field = substr($field, 5); // Remove 'with:' prefix
        $segments = explode(':', $field);

        if (count($segments) === 3) {
            [$relation, $columns, $operator] = $segments;
            $columnsArray = explode(',', $columns);

            $query->{$method}($relation, function ($q) use ($columnsArray, $operator, $value) {
                // Use OR logic between columns within the same relationship
                $q->where(function($subQ) use ($columnsArray, $operator, $value) {
                    foreach ($columnsArray as $column) {
                        self::applyCondition($subQ, 'orWhere', trim($column), $value, $operator);
                    }
                });
            });
        } else {
            throw new \InvalidArgumentException("Invalid field format. Expected 'with:relation:columns:operator'.");
        }
    }


    
    /**
     * Apply a single condition to the query builder with various operators.
     * 
     * @param Builder $query The query builder instance
     * @param string $method The query method to use (where, orWhere, etc.)
     * @param string $field The database field/column name
     * @param mixed $value The value to compare against
     * @param string $operator The comparison operator
     * @return void
     * 
     * Supported Operators:
     * - 'like': Case-insensitive LIKE search with wildcards
     * - 'in': IN clause with array of values
     * - 'between': BETWEEN clause with array of [min, max]
     * - 'date_between': Date range with start/end of day boundaries
     * - 'greater_than': Greater than comparison (>)
     * - 'less_than': Less than comparison (<)
     * - 'equal': Equality comparison (=)
     * - 'not_equal' or '!=': Inequality comparison (!=)
     * - 'date': Date equality comparison
     * - Custom operators: Any standard SQL operator
     * 
     * @example Usage:
     * ```php
     * // Text search (case-insensitive)
     * QueryProcessor::applyCondition($query, 'where', 'name', 'john', 'like');
     * 
     * // Array of values
     * QueryProcessor::applyCondition($query, 'where', 'status', ['active', 'pending'], 'in');
     * 
     * // Numeric range
     * QueryProcessor::applyCondition($query, 'where', 'age', [18, 65], 'between');
     * 
     * // Date range with full day boundaries
     * QueryProcessor::applyCondition($query, 'where', 'created_at', ['2023-01-01', '2023-12-31'], 'date_between');
     * 
     * // Comparison operators
     * QueryProcessor::applyCondition($query, 'where', 'score', 80, 'greater_than');
     * ```
     */
    
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
            case '>':
                $query->{$method}($field, '>', $value);
                break;
            case 'greater_than_or_equal':
            case '>=':
                $query->{$method}($field, '>=', $value);
                break;
            case 'less_than':
            case '<':
                $query->{$method}($field, '<', $value);
                break;
            case 'less_than_or_equal':
            case '<=':
                $query->{$method}($field, '<=', $value);
                break;
            case 'equal':
            case '=':
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

/*
*
*

// In your controller or service
class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query();
        
        // Define filters from request
        $filters = [
            [
                'tasks:name,description:like' => $request->get('search'),
                'tasks:status:in' => $request->get('statuses', []),
                'tasks:priority:greater_than' => $request->get('min_priority'),
                'tasks:due_date:date_between' => [$request->get('start_date'), $request->get('end_date')],
                'with:user:name:like' => $request->get('assignee'),
                'with:children' => $request->get('include_children', false)
            ]
        ];
        
        // Define sorting
        $sorts = [
            'priority' => 'desc',
            'due_date' => 'asc'
        ];
        
        // Apply filters and sorts
        $query = QueryProcessor::applyFilters($query, $filters, 2); // 2 levels deep for children
        $query = QueryProcessor::applySorts($query, $sorts);
        
        return $query->paginate(15);
    }
}

*
*
*/



/*
*
*

// Multiple filter groups (AND between groups)
$filters = [
    [ // Group 1 - Basic filters
        'users:name:like' => 'john',
        'users:status:equal' => 'active'
    ],
    [ // Group 2 - Date and relationship filters
        'users:created_at:date_between' => ['2023-01-01', '2023-12-31'],
        'with:posts:status:equal' => 'published'
    ]
];

// Single group with multiple OR conditions
$filters = [
    [
        'products:name,description,sku:like' => 'laptop', // Search in multiple columns
        'products:price:between' => [100, 1000],
        'with:category:name:in' => ['Electronics', 'Computers']
    ]
];


*
*
*/