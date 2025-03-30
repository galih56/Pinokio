<?php

namespace App\Services\Authorizations;

use App\Models\UserRole;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Helpers\QueryProcessor;

class UserRoleService
{
    protected UserRole $model;

    public function __construct(
        UserRole $model,
    )
    {
        $this->model = $model;
    }

    public function getRelatedData(array $additionals = [])
    {
        $basic_relations = [
            'users',
        ];

        return array_merge($basic_relations, $additionals);
    }

    public function searchUserRole(string $keyword){
        $query = $this->model->newQuery();
        $query->where(DB::raw("LOWER(code)"), 'like', "%".strtolower($keyword)."%")->orWhere(DB::raw("LOWER(name)"), 'like', "%".strtolower($keyword)."%");
        $query->limit(6);
        
        return $query->get();
    }

    public function get(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);

        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function getById(int $id): ?UserRole
    {
        return $this->model::with($this->getRelatedData())->findOrFail($id);
    }

    public function update(int $id, array $data)
    {
        $role = $this->model->find($id);
        $role->update($data);
        return $role;
    }

    public function delete(int $id)
    {
        $role = $this->model->find($id);
        if ($role->users()->exists()) {
            throw new \Exception("Cannot delete role. Users are assigned to this role.");
        }
        return $role->delete();
    }

    public function assignToUser(int $userId, int $roleId)
    {
        $user = $this->model->find($userId);
        $user->role_id = $roleId;
        $user->save();
        return $user;
    }

    public function getUserRole(int $userId)
    {
        return $this->model->with('role')->findOrFail($userId)->role;
    }
}
