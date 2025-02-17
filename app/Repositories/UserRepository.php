<?php

namespace App\Repositories;

use App\Interfaces\FilterableRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Auth;

class UserRepository extends FilterableRepository
implements FilterableRepositoryInterface, UserRepositoryInterface
{
    protected $related_data = [
        'role'
    ];

    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function get(
        array $filters = [], 
        int $perPage = 0,
        array $sorts = [], 
        array $relations = []
    ): Collection|LengthAwarePaginator {
        $relations = empty($relations) ? $this->related_data : $relations;
   
        return parent::get($filters, $perPage, $sorts, $relations);
    }

    public function find(int $id) : ?User
    {
        $user = $this->model::with($this->related_data)->find($id);
        return  $user;
    }

    public function create(array $data)
    {
        $user = $this->model->create($data);
        $user = $this->model::with($this->related_data)->find($user->id);
        return $user;
    }

    public function update(int $id, array $data) : User
    {
        $user = $this->model->find($id); 

        if(isset($data['password']) && $data['password']){
            $data['password'] = Hash::make($data['password']);
        }
        $user->update($data); 
        
        $user = $this->model::with($this->related_data)->find($id);
        return $user; 
    }

    public function getUserRoles()
    {
        $user = Auth::user();
        
        $roles = UserRole::select('id','code','name')->whereNot('code','ADMIN');

        if($user){
            $user = $user->load(['role']);
            if($user->role){
                if($user->role->code == 'ADMIN'){
                    $roles = UserRole::select('id','code','name');
                }
            }
        }

        $roles = $roles->get();
        return $roles;
    }
    
}
