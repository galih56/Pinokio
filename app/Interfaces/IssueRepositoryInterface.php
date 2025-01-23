<?php

namespace App\Interfaces;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface IssueRepositoryInterface extends RepositoryInterface
{
    public function getPublicIssues(array $search = [], int $perPage = 0, array $sorts = [], array $relations = []): Collection|LengthAwarePaginator;
}
