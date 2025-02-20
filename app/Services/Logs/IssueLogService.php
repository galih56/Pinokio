<?php

namespace App\Services\Logs;

use App\Models\Logs\IssueLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Helpers\QueryProcessor;

class IssueLogService
{
    protected $model;

    public function __construct(
        IssueLog $model,
    )
    {
        $this->model = $model;
    }

    
    public function getRelatedData()
    {
        return [
            'issue',
            'user'
        ];
    }
    
    /**
     * Create a new issue log entry.
     *
     * @param  array  $data
     * @return \App\Models\Logs\IssueLog
     */
    public function create(array $data): IssueLog
    {
        try {
            return IssueLog::create($data);
        } catch (\Exception $e) {
            Log::error('Error creating Issue Log: ' . $e->getMessage());
            throw new \Exception('Unable to create issue log.');
        }
    }

    /**
     * Update an existing issue log entry.
     *
     * @param  int  $logId
     * @param  array  $data
     * @return \App\Models\IssueLog
     */
    public function update(int $logId, array $data): IssueLog
    {
        try {
            // Find the issue log by ID
            $log = $this->model->findOrFail($logId);
            $log->update($data);
            return $log;
        } catch (\Exception $e) {
            Log::error('Error updating Issue Log: ' . $e->getMessage());
            throw new \Exception('Unable to update issue log.');
        }
    }

    /**
     * Get all issue logs for a specific issue.
     *
     * @param  int  $issueId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getIssueLogs(int $issueId, array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        try {
            $query = $this->model->newQuery();
    
            $query = QueryProcessor::applyFilters($query, $filters)->where('issue_logs.issue_id',$issueId);
            $query = QueryProcessor::applySorts($query, $sorts);

            $query->with([ 'user' ]);
            return $perPage ? $query->paginate($perPage) : $query->get();
        } catch (\Exception $e) {
            Log::error('Error retrieving Issue Logs for Issue ID ' . $issueId . ': ' . $e->getMessage());
            throw new \Exception('Unable to retrieve issue logs.');
        }
    }
    
    /**
    * Get issue logs for a specific issue and user (User or GuestIssuer).
    *
    * @param  int  $issueId
    * @param  int  $userId
    * @param  string  $issuerType ('user' or 'guest_issuer')
    * @return \Illuminate\Database\Eloquent\Collection
    */
    public function getIssueLogsByUser(int $issueId, int $issuerId, string $issuerType)
    {
        try {
            // Resolve the correct class using MorphMap
            $resolvedType = Relation::getMorphedModel($issuerType);
            if (!$resolvedType) {
                throw new \Exception("Invalid user type: $issuerType");
            }

            return IssueLog::where('issue_id', $issueId)
                ->where('issuer_id', $issuerId)
                ->where('issuer_type', $resolvedType)
                ->get();
        } catch (\Exception $e) {
            Log::error("Error retrieving Issue Logs for Issue ID {$issueId} and User ID {$issuerId}: " . $e->getMessage());
            throw new \Exception('Unable to retrieve issue logs.');
        }
    }

    /**
     * Delete an issue log entry.
     *
     * @param  int  $logId
     * @return bool
     */
    public function delete(int $logId): bool
    {
        try {
            // Find the log and delete it
            $log = IssueLog::findOrFail($logId);
            return $log->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting Issue Log: ' . $e->getMessage());
            throw new \Exception('Unable to delete issue log.');
        }
    }
}
