<?php

namespace App\Services;

use App\Models\Team;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Exception;
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
        $data['creator_id'] = Auth::id();
    
        do {
            $data['color'] = ColorGenerator::generateHex();
        } while ($this->colorExists($data['name'], $data['color']));
    
        $this->model = $this->model->create($data);
        return $this->model;
    }

    public function update(int $id, array $data): Team
    {
        $this->model = Team::findOrFail($id);
        $this->model->update($data);
        return $this->model;
    }

    public function delete(int $id): bool
    {
        $team = Team::findOrFail($id);
        return $team->delete();
    }
}
