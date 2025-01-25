<?php

namespace App\Services;

use App\Interfaces\IssueRepositoryInterface;
use App\Models\Issue;
use App\Models\File;
use Illuminate\Support\Facades\Log;
use App\Models\GuestIssuer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

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
            $guestIssuer = $this->getOrCreateGuestIssuer($data['email'], $data['name'], $data['ip_address']);

            $issueData = $this->prepareIssueData($data);
            $issueData['guest_issuer_id'] = $guestIssuer->id;

            $issue = $this->issueRepository->create($issueData);

            // Use FileService to upload files and get an array of File models
            $uploadedFiles = $this->fileService->upload($data['files'] ?? []); 

            // Attach files to issue if any files are uploaded
            if (!empty($uploadedFiles)) {
                $this->attachFilesToIssue($issue, $uploadedFiles);
            }

            $tagIds = $data['tag_ids'] ?? ($data['tag_id'] ? [$data['tag_id']] : []);
            if (!empty($tagIds)) {
                $this->issueRepository->attachTags($issue, $tagIds);
            }

            $issue->refresh();
            $issue->load(['tags', 'files', 'guestIssuer']);

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
