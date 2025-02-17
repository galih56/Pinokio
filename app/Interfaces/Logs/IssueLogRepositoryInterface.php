<?php

namespace App\Interfaces\Logs;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\IssueLog;
use App\Interfaces\FilterableRepositoryInterface;

interface IssueLogRepositoryInterface extends FilterableRepositoryInterface
{
}
