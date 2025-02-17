<?php

namespace App\Interfaces;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Issue;

interface IssueRepositoryInterface extends FilterableRepositoryInterface
{
}
