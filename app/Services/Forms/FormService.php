<?php

namespace App\Services\Forms;

use App\Models\Forms\Form;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Helpers\QueryProcessor;
use App\Models\Forms\FormToken;
use Illuminate\Support\Str;

class FormService
{
    protected Form $model;

    public function getRelatedData()
    {
        return [ 
            'tokens',
            'attempts',
            'templates'
        ];
    }

    public function __construct(
        Form $model,
    )
    {
        $this->model = $model;
    }

    public function get(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);

        return $perPage ? $query->paginate($perPage) : $query->get();
    }
    public function getById(int $id): ?Form
    {
        $this->model = Form::findOrFail($id);
        return $this->model;
    }

    /**
     * Create a new tag.
     */
    public function create(array $data): Form
    {
        
        if (isset($data['form_url'])) {
            $data['form_code'] = $this->extractGoogleFormCode($data['form_url']);
        }

        $this->model = $this->model->create($data);
        return $this->model;
    }

    /**
     * Update an existing tag.
     */
    public function update(int $id, array $data): Form
    {
        $model = $this->model->find($id);
        $model->update($data);
        return $model;
    }

    /**
     * Delete a tag.
     */
    public function delete(int $id): bool
    {
        $model = $this->model->find($id);
        return $model->delete();
    }

    public function generateToken(Form $form, array $data): string
    {
        dd($data);
        $token = Str::random(32);

        FormToken::create([
            'form_id'    => $form->id,
            'token'      => $token,
            'identifier' => $data['identifier'] ?? null,
            'expires_at' => isset($data['expires_at']) 
                ? now()->parse($data['expires_at']) 
                : now()->addDays(1), // fallback
        ]);

        return $token;
    }

    public function triggerOpenTime(string $token): ?FormToken
    {
        $formToken = FormToken::where('token', $token)->firstOrFail();

        if (!$formToken->open_time) {
            $formToken->update(['open_time' => now()]);
        }

        return $formToken;
    }

    protected function extractGoogleFormCode(?string $url): ?string
    {
        if (!$url) return null;

        preg_match('#/forms/d/e/([^/]+)/#', $url, $matches);

        if (!isset($matches[1])) {
            logger()->warning('Failed to extract Google Form code', ['url' => $url]);
            return null;
        }

        return $matches[1];
    }
}
