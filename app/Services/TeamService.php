<?php

namespace App\Services;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Helpers\QueryProcessor;
use App\Helpers\ColorGenerator;
use Auth;

class TeamService
{
    protected $model;

    public function __construct(
        Team $model,
    )
    {
        $this->model = $model;
    }


    public function getRelatedData(array $additionals = [])
    {
        $basic_relations = [
            'assignments',
            'members'
        ];

        return array_merge($basic_relations, $additionals);
    }

    public function get(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);
        
        $query->with($this->getRelatedData());
        
        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    public function getById(int $id): Team
    {        
        $this->model = Team::with($this->getRelatedData())->find($id);
        return $this->model;
    }

    private function colorExists(string $name, string $color): bool
    {
        return Team::where('name', $name)->where('color', $color)->exists();
    }

    public function create(array $data): Team
    {
        $data['created_by'] = Auth::id();
    
        if(empty($data['color'])){
            do {
                $data['color'] = ColorGenerator::generateHex();
            } while ($this->colorExists($data['name'], $data['color']));
        }

        $this->model = $this->model->create($data);

        if($data['members']){
            $this->attachUsersToTeam($this->model, $data['members']);
        }

        return $this->model;
    }

    public function update(int $id, array $data): Team
    {
        $this->model = Team::findOrFail($id);
        $this->model->update($data);

        if(isset($data['members'])){
            $this->updateTeamMembers($id, $data['members']);
        }
        return $this->model;
    }

    public function delete(int $id): bool
    {
        $team = Team::findOrFail($id);
        return $team->delete();
    }
    public function attachUsersToTeam(Team $model, array $members){
        $members = User::find($members);
        $this->model->members()->attach($members);
    }

    public function updateTeamMembers(int $teamId, array $members): bool
    {
        $this->model = Team::findOrFail($teamId);

        $existingUserIds = $this->model->members()->pluck('users.id')->toArray();

        $membersToRemove = array_diff($existingUserIds, $members);
        $newMembers = array_diff($members, $existingUserIds);

        if (!empty($membersToRemove)) {
            $this->model->members()->detach($membersToRemove);
        }

        if (!empty($newMembers)) {
            $this->model->members()->attach($newMembers);
        }

        return true;
    }
}
