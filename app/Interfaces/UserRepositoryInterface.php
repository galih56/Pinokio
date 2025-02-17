<?php

namespace App\Interfaces;

use App\Models\User;

interface UserRepositoryInterface extends FilterableRepositoryInterface
{
    public function getUserRoles();
}
