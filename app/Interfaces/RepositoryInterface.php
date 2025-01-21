<?php

namespace App\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface RepositoryInterface
{
    /**
     * Get records with optional search and pagination.
     *
     * @param array $search An associative array of search to apply to the query.
     * @param int|null $perPage The number of items per page for pagination. If null, no pagination is applied.
     * @param array $sorts An associative array of sorting options to apply to the query.
     * @param array $relations An array of relationships to eager load. Can include closures for custom eager loading.
     *
     * @return Collection|LengthAwarePaginator
     */
    public function get(array $search = [], int $perPage = 0, array $sorts = [], array $relations = []): Collection|LengthAwarePaginator;
    
    /**
     * Get records with optional search and pagination.
     *
     * @param array $search An associative array of search to apply to the query.
     * @param array $sorts An associative array of sorting options to apply to the query.
     * @param array $relations An array of relationships to eager load. Can include closures for custom eager loading.
     *
     * @return Builder
     */
    public function getQuery(array $search = [], array $sorts = [],  array $relations = []): Builder;

    /**
     * Find a record by its ID.
     *
     * @param mixed $id
     * @return mixed
     */
    public function find(int $id) : ? Model;

    /**
     * Create a new record.
     *
     * @param array $data
     * @return mixed
     */
    public function create(array $data);

    /**
     * Update an existing record.
     *
     * @param mixed $id
     * @param array $data
     * @return mixed
     */
    public function update(int $id, array $data) : Model;

    /**
     * Delete a record by its ID.
     *
     * @param mixed $id
     * @return bool
     */
    public function delete(int $id) : bool;

    /**
     * Apply search to a query.
     *
     * @param Builder $query
     * @param array $search
     * @return Builder
     */
    public function applyFilters(Builder $query, array $search): Builder;

    /**
     * Apply sorting to a query.
     *
     * @param Builder $query
     * @param array $sorts
     * @return Builder
     */
    public function applySorts(Builder $query, array $sorts): Builder;

    /**
     * Count records based on conditions.
     *
     * @param array $conditions
     * @return int
     */
    public function count(array $conditions = []): int;
}
