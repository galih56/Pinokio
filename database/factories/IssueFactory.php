<?php

namespace Database\Factories;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Models\GuestIssuer;
use Illuminate\Database\Eloquent\Factories\Factory;

class IssueFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Issue::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        // Randomly decide if the issuer is a User or a GuestIssuer
        $issuerType = $this->faker->randomElement([User::class, GuestIssuer::class]);
        $issuer = $issuerType::factory()->create();

        return [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'due_date' => $this->faker->dateTimeBetween('now', '+1 year'),
            'project_id' => Project::factory(),
            'issuer_id' => $issuer->id,
            'issuer_type' => $issuerType,
        ];
    }

    /**
     * Configure the factory to create an issue with a specific issuer.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $issuer
     * @return $this
     */
    public function withIssuer($issuer)
    {
        return $this->state(function (array $attributes) use ($issuer) {
            return [
                'issuer_id' => $issuer->id,
                'issuer_type' => get_class($issuer),
            ];
        });
    }

    /**
     * Configure the factory to create an issue with a specific project.
     *
     * @param  \App\Models\Project  $project
     * @return $this
     */
    public function forProject($project)
    {
        return $this->state(function (array $attributes) use ($project) {
            return [
                'project_id' => $project->id,
            ];
        });
    }
}