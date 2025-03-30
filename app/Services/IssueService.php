<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\User;
use App\Models\GestIssuer;
use App\Models\File;
use Illuminate\Support\Facades\Log;
use App\Models\GuestIssuer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Helpers\DatetimeHelper;
use App\Services\Logs\IssueLogService;
use App\Helpers\QueryProcessor;
use Auth;
use DB;

class IssueService
{
    protected $model;
    protected $guestIssuerService;
    protected $fileService;
    protected $issueLogService;

    public function __construct(
        Issue $model,
        IssueLogService $issueLogService,
        GuestIssuerService $guestIssuerService,
        FileService $fileService, 
    )
    {
        $this->model = $model;
        $this->guestIssuerService = $guestIssuerService;
        $this->fileService = $fileService;
        $this->issueLogService = $issueLogService;
    }

    
    public function getRelatedData(array $additionals = [])
    {
        $basic_relations = [
            'tags',
            'files',
            'issuer',
        ];

        return array_merge($basic_relations, $additionals);
    }


    public function searchIssues(string $keyword){
        $query = $this->model->newQuery();
        $query->where(DB::raw("LOWER(title)"), 'like', "%".strtolower($keyword)."%")->orWhere(DB::raw("LOWER(description)"), 'like', "%".strtolower($keyword)."%");
        $query->limit(6);
        
        return $query->get();
    }
    
    public function create(array $data): Issue
    {
        try {
            $issuer = null;
            if ($data['issuer_type'] == 'guest_issuer') {
                // If the user is a guest, create or fetch the GuestIssuer
                $issuer =  $this->guestIssuerService->getOrCreateGuestIssuer($data['email'], $data['name'], $data['ip_address']);
                $issuerType = 'guest_issuer';
            } else {
                // If the user is authenticated, set the issuer as the User
                $issuer = auth()->user();
                $issuerType = 'user';
            }
    
            // Prepare issue data
            $data = $this->prepareIssueData($data);
    
            // Set the polymorphic issuer relationship
            $data['issuer_id'] = $issuer->id;
            $data['issuer_type'] = $issuerType;
            $data['status'] = 'idle';

            // Create the issue
            $this->model = $this->model->create($data);
    
            // Use FileService to upload files and get an array of File models
            $uploadedFiles = $this->fileService->upload($data['files'] ?? [], 'issue_files' ,$issuer);
    
            // Attach files to the issue if any files are uploaded
            if (!empty($uploadedFiles)) {
                $this->attachFilesToIssue( $this->model->id, $uploadedFiles);
            }
    
            // Attach tags to the issue if any tag IDs are provided
            $tagIds = $data['tag_ids'] ?? (isset($data['tag_id']) ? [$data['tag_id']] : []);
            if (!empty($tagIds)) {
                $this->attachTags( $this->model->id, $tagIds);
            }
    
            // Refresh and load relationships
            $this->model->refresh();
            $this->model->load( $this->getRelatedData());
    
            $this->issueLogService->create([
                'issue_id' =>  $this->model->id,
                'user_id' => $issuer->id,
                'user_type' => $issuerType,
                'action' => 'created',
                'action_details' => json_encode(['description' => 'Issue created']),
            ]);
            return $this->model;
        } catch (\Exception $e) {
            Log::error('Error creating issue: ' . $e->getMessage());
            throw $e;
        }
    }

    public function update(int $id, array $data): Issue
    {
        try {
            $data = $this->prepareIssueData($data);
                
            $this->model = $this->model->find($id);
            $issue = $this->model->update($data);

            $tagIds = $data['tag_ids'] ?? ($data['tag_id'] ? [$data['tag_id']] : []);
            if (!empty($tagIds)) {
                $this->attachTags($issue->id, $tagIds);
            }

            $issue->refresh();
            $issue->load($this->getRelatedData());

            $this->issueLogService->create([
                'issue_id' => $this->model->id,
                'user_id' => isset($data['user_id']) ? $data['user_id'] : null,
                'action' => 'updated',
                'action_details' => json_encode(['updated_fields' => array_keys($data)]),
            ]);
            return $issue;
        } catch (\Exception $e) {
            Log::error('Error updating issue: ' . $e->getMessage());
            throw $e;
        }
    }


    
    public function updateStatus(int $id, array $data): Issue
    {
        try {
            $issuer = null;
            if ($data['issuer_type'] == 'guest_issuer') {
                // If the user is a guest, create or fetch the GuestIssuer
                $issuer =  $this->guestIssuerService->getOrCreateGuestIssuer($data['email'], $data['name'], $data['ip_address']);
                $issuerType = 'guest_issuer';
                                
                $this->model = $this->model->where('id',$id)->where('issuer_type', $issuerType)->firstOrFail();
                $this->model->status = 'closed';
                $this->model->save();
            } else {
                // If the user is authenticated, set the issuer as the User
                $issuer = auth()->user();
                $issuerType = 'user';

                $this->model = $this->model->find($id);
                $this->model->status = $data['status'];
                $this->model->save();
            }
            
            $this->issueLogService->create([
                'issue_id' => $this->model->id,
                'user_id' => $issuer->id,
                'user_type' => $issuerType,
                'action' => 'status_change',
                'action_details' => json_encode(['previous_status' =>  $this->model->getOriginal('status'), 'new_status' => 'closed']),
            ]);
            return $this->model;
        } catch (\Exception $e) {
            Log::error('Error closing issue: ' . $e->getMessage());
            throw $e;
        }
    }


    public function delete(int $id): bool
    {
        try {
            $this->model = $this->model->find($id);
            if (!$this->model) {
                throw new Exception("Issue not found.");
            }

            $this->model->tags()->detach();
            $deleted = $this->model->delete($id);
            $this->issueLogService->create([
                'user_id' => auth()->id(), 
                'user_type' => 'user',
                'action' => 'deleted',
                'action_details' => json_encode(['description' => 'Issue "'.$issue->title.'" is deleted']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting issue: ' . $e->getMessage());
            throw $e;
        }
    }

    public function get(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);
        
        $query->with($this->getRelatedData([
            'comments' => function ($query) {
                $query->whereDoesntHave('reads', function ($q) {
                    $q->where('user_id', Auth::id());
                })
                ->latest()
                ->take(3);
            }
        ]))->withCount([
            'comments as unread_comments_count' => function ($query) {
                $query->whereDoesntHave('reads', function ($q) {
                    $q->where('user_id', Auth::id());
                });
            }
        ]);
        
        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    public function getPublicIssues(array $filters = [], int $perPage = 0, array $sorts = [], $email = ''): Collection | LengthAwarePaginator
    {
        $issuer =  $this->guestIssuerService->getByEmail($email);
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);

        $query = $query->where('issues.issuer_type', 'guest_issuer');
        
        $query->with($this->getRelatedData());
        
        return $query->paginate($perPage);
    }

    public function getById(int $id): ?Issue
    {
        return Issue::with($this->getRelatedData())->findOrFail($id);
    }

    public function getFiles(int $id) {
        $issue = Issue::with('files')->find($id);

        return $issue->files;
    }

    /**
     * Prepares issue data before creation or update.
     *
     * @param array $data
     * @return array
     */
    protected function prepareIssueData(array $data): array
    {
        $preparedData = $data;
        if(isset($preparedData['name'])) unset($preparedData['name']); 
        if(isset($preparedData['email'])) unset($preparedData['email']); 
        if(isset($preparedData['tag_id'])) unset($preparedData['tag_id']); 
        if(isset($preparedData['tag_ids'])) unset($preparedData['tag_ids']); 
        if(isset($preparedData['files'])) unset($preparedData['files']); 

        if(isset($preparedData)){
            $preparedData['due_date'] = DatetimeHelper::createDateTimeObject($preparedData['due_date']);
            if($preparedData['due_date']) $preparedData['due_date'] = $preparedData['due_date']->format('Y-m-d H:i:s');
            else unset($preparedData['due_date']);
        }

        return $preparedData;
    }

    public function attachFilesToIssue($id, $files): void
    {
        $this->model = $this->model->with('files')->find($id);
        if (!is_array($files)) {
            $files = [$files];
        }
        foreach ($files as $file) {
            // Ensure $file is a File model, and attach the file ID to the issue
            if ($file instanceof File) {
                $this->model->files()->attach($file->id); // Attach the file's ID
            }
        }
    }

    
    public function attachTags(int $id, array $tagIds): void
    {
        $this->model = $this->model->find($id);
        $tags = Tag::find($tagIds);
        $this->model->tags()->attach($tags);
    }


}
