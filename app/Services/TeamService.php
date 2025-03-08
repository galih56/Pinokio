<?php

namespace App\Services;

use App\Models\Team;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Exception;

class TeamService
{
    /**
     * Get all teams.
     */
    public function getAll(): Collection
    {
        return Team::all();
    }

    /**
     * Find a team by ID.
     */
    public function findById(int $id): Team
    {
        return Team::findOrFail($id);
    }

    /**
     * Create a new team.
     */
    public function create(array $data): Team
    {
        return Team::create($data);
    }

    /**
     * Update a team.
     */
    public function update(int $id, array $data): Team
    {
        $team = Team::findOrFail($id);
        $team->update($data);
        return $team;
    }

    /**
     * Delete a team.
     */
    public function delete(int $id): bool
    {
        $team = Team::findOrFail($id);
        return $team->delete();
    }
}
