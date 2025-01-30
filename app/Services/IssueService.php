<?php

namespace App\Services;

use App\Interfaces\IssueRepositoryInterface;
use App\Models\Issue;
use App\Models\User;
use App\Models\GestIssuer;
use App\Models\File;
use Illuminate\Support\Facades\Log;
use App\Models\GuestIssuer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Helpers\DatetimeHelper;

class IssueService
{
    protected $issueRepository;
    protected $fileService;

    public function __construct(IssueRepositoryInterface $issueRepository, FileService $fileService)
    {
        $this->issueRepository = $issueRepository;
        $this->fileService = $fileService;
    }

    public function createIssue(array $data): Issue
    {
        try {
            $issuer = null;
            if ($data['issuer_type'] == 'guest') {
                // If the user is a guest, create or fetch the GuestIssuer
                $issuer = $this->getOrCreateGuestIssuer($data['email'], $data['name'], $data['ip_address']);
                $issuerType = GuestIssuer::class;
            } else {
                // If the user is authenticated, set the issuer as the User
                $issuer = auth()->user();
                $issuerType = User::class;
            }
    
            // Prepare issue data
            $issueData = $this->prepareIssueData($data);
    
            // Set the polymorphic issuer relationship
            $issueData['issuer_id'] = $issuer->id;
            $issueData['issuer_type'] = $issuerType;
            $issueData['status'] = 'idle';

            // Create the issue
            $issue = $this->issueRepository->create($issueData);
    
            // Use FileService to upload files and get an array of File models
            $uploadedFiles = $this->fileService->upload($data['files'] ?? [], 'issue_files' ,$issuer);
    
            // Attach files to the issue if any files are uploaded
            if (!empty($uploadedFiles)) {
                $this->attachFilesToIssue($issue, $uploadedFiles);
            }
    
            // Attach tags to the issue if any tag IDs are provided
            $tagIds = $data['tag_ids'] ?? ($data['tag_id'] ? [$data['tag_id']] : []);
            if (!empty($tagIds)) {
                $this->issueRepository->attachTags($issue, $tagIds);
            }
    
            // Refresh and load relationships
            $issue->refresh();
            $issue->load(['tags', 'files', 'issuer']);
    
            return $issue;
        } catch (\Exception $e) {
            Log::error('Error creating issue: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateIssue(int $id, array $data): Issue
    {
        try {
            $issueData = $this->prepareIssueData($data);
            $issue = $this->issueRepository->update($id, $issueData);

            $tagIds = $data['tag_ids'] ?? ($data['tag_id'] ? [$data['tag_id']] : []);
            if (!empty($tagIds)) {
                $this->issueRepository->attachTags($issue, $tagIds);
            }

            $issue->refresh();
            $issue->load(['tags', 'files', 'guestIssuer']);

            return $issue;
        } catch (\Exception $e) {
            Log::error('Error updating issue: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteIssue(int $id): bool
    {
        try {
            return $this->issueRepository->delete($id);
        } catch (\Exception $e) {
            Log::error('Error deleting issue: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getAllIssues(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        return $this->issueRepository->getAll($filters, $perPage, $sorts);
    }

    public function getPublicIssues(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        return $this->issueRepository->getPublicIssues($filters, $perPage, $sorts);
    }

    public function getIssueById(int $id): ?Issue
    {
        return $this->issueRepository->getById($id);
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
    
    protected function getOrCreateGuestIssuer(string $email, string $name, string $ip): GuestIssuer
    {
        // Check if the guest issuer with this email already exists
        $guestIssuer = GuestIssuer::firstOrCreate(
            ['email' => $email], // Check by email
            [
                'name' => $name,
                'ip_address' => $ip
            ]   
        );

        return $guestIssuer;
    }

    public function attachFilesToIssue(Issue $issue, $files): void
    {
        // If a single file is passed, convert it to an array
        if (!is_array($files)) {
            $files = [$files];
        }
    
        foreach ($files as $file) {
            // Ensure $file is a File model, and attach the file ID to the issue
            if ($file instanceof File) {
                $issue->files()->attach($file->id); // Attach the file's ID
            }
        }
    }
}
