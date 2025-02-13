<?php

namespace App\Interfaces;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Issue;

interface IssueRepositoryInterface extends RepositoryInterface
{
    public function updateStatus(int $id, array $data) : Issue;
    public function attachFiles(int $id, $files): void;
    public function getLogs(int $id = null) : Collection | LengthAwarePaginator;
}
