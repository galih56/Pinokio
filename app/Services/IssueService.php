<?php

namespace App\Services;

use App\Interfaces\IssueRepositoryInterface;
use App\Models\Issue;
use App\Models\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\GuestIssuer;

class IssueService
{
    protected $issueRepository;

    public function __construct(IssueRepositoryInterface $issueRepository)
    {
        $this->issueRepository = $issueRepository;
    }

    public function createIssue(array $data): Issue
    {
        try {
            $guestIssuer = $this->getOrCreateGuestIssuer($data['email'], $data['name'], $data['ip_address']);

            $issueData = $this->prepareIssueData($data);
            $issueData['guest_issuer_id'] = $guestIssuer->id;

            $issue = $this->issueRepository->create($issueData);

            $fileIds = $this->uploadFiles($guestIssuer,$data['files'] ?? []);
            if (!empty($fileIds)) {
                $this->issueRepository->attachFiles($issue, $fileIds);
            }

            $tagIds = $data['tag_ids'] ?? ($data['tag_id'] ? [$data['tag_id']] : []);

            if (!empty($tagIds)) {
                $this->issueRepository->attachTags($issue, $tagIds);
            }

            if (!empty($fileIds)) {
                $this->attachFilesToIssue($issue, $fileIds);
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
            $fileIds = $this->uploadFiles($data['files'] ?? []);

            $issueData = $this->prepareIssueData($data);
            $issue = $this->issueRepository->update($id, $issueData);

            if (!empty($fileIds)) {
                $this->issueRepository->attachFiles($issue, $fileIds);
            }

            $tagIds = $data['tag_ids'] ?? ($data['tag_id'] ? [$data['tag_id']] : []);
            if (!empty($tagIds)) {
                $this->issueRepository->attachTags($issue, $tagIds);
            }

            if (!empty($fileIds)) {
                $this->attachFilesToIssue($issue, $fileIds);
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

    public function getAllIssues(array $filters = [], int $perPage = 0, array $sorts = []): LengthAwarePaginator
    {
        return $this->issueRepository->getAll($filters, $perPage, $sorts);
    }

    public function getIssueById(int $id): ?Issue
    {
        return $this->issueRepository->getById($id);
    }

    /**
     * Upload files and return their IDs.
     *
     * @param array $files
     * @return array
     */
    protected function uploadFiles(GuestIssuer $guest, array $files): array
    {
        $fileIds = [];

        foreach ($files as $file) {
            if ($file->isValid()) {
                $filePath = $file->store('issues'); // Store file in the 'issues' directory
                $uploadedFile = File::create([
                    'path' => $filePath,
                    'name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'uploaded_at' => now(),
                    'uploader_id' => $guest->id,
                    'uploader_type' => get_class($guest),
                ]);
                $fileIds[] = $uploadedFile->id;
            }
        }

        return $fileIds;
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


    protected function attachFilesToIssue(Issue $issue, array $fileIds): void
    {
        foreach ($fileIds as $fileId) {
            // Use the file_associations table to associate files with the issue
            $issue->files()->create([
                'file_id' => $fileId,
                'related_id' => $issue->id,
                'related_type' => Issue::class, // Related type is the Issue model
            ]);
        }
    }
}
