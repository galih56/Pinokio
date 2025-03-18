<?php

namespace App\Services\Logs;

use App\Models\Logs\TaskLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Helpers\QueryProcessor;

class TaskLogService
{
    protected $model;

    public function __construct(
        TaskLog $model,
    )
    {
        $this->model = $model;
    }

    
    public function getRelatedData()
    {
        return [
            'task',
            'user'
        ];
    }
    
    /**
     * Create a new task log entry.
     *
     * @param  array  $data
     * @return \App\Models\Logs\TaskLog
     */
    public function create(array $data): TaskLog
    {
        try {
            return TaskLog::create($data);
        } catch (\Exception $e) {
            Log::error('Error creating Issue Log: ' . $e->getMessage());
            throw new \Exception('Unable to create task log.');
        }
    }

    /**
     * Update an existing task log entry.
     *
     * @param  int  $logId
     * @param  array  $data
     * @return \App\Models\TaskLog
     */
    public function update(int $logId, array $data): TaskLog
    {
        try {
            // Find the task log by ID
            $log = $this->model->findOrFail($logId);
            $log->update($data);
            return $log;
        } catch (\Exception $e) {
            Log::error('Error updating Issue Log: ' . $e->getMessage());
            throw new \Exception('Unable to update task log.');
        }
    }

    /**
     * Get all task logs for a specific task.
     *
     * @param  int  $taskId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTaskLogs(int $taskId, array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        try {
            $query = $this->model->newQuery();
    
            $query = QueryProcessor::applyFilters($query, $filters)->where('task_logs.task_id',$taskId);
            $query = QueryProcessor::applySorts($query, $sorts);

            $query->with([ 'user' ]);
            return $perPage ? $query->paginate($perPage) : $query->get();
        } catch (\Exception $e) {
            Log::error('Error retrieving Issue Logs for Issue ID ' . $taskId . ': ' . $e->getMessage());
            throw new \Exception('Unable to retrieve task logs.');
        }
    }
    
    /**
    * Get task logs for a specific task and user (User or GuestIssuer).
    *
    * @param  int  $taskId
    * @param  int  $userId
    * @param  string  $taskrType ('user' or 'guest_taskr')
    * @return \Illuminate\Database\Eloquent\Collection
    */
    public function getTaskLogsByUser(int $taskId, int $taskrId, string $taskrType)
    {
        try {
            // Resolve the correct class using MorphMap
            $resolvedType = Relation::getMorphedModel($taskrType);
            if (!$resolvedType) {
                throw new \Exception("Invalid user type: $taskrType");
            }

            return TaskLog::where('task_id', $taskId)
                ->where('taskr_id', $taskrId)
                ->where('taskr_type', $resolvedType)
                ->get();
        } catch (\Exception $e) {
            Log::error("Error retrieving Issue Logs for Issue ID {$taskId} and User ID {$taskrId}: " . $e->getMessage());
            throw new \Exception('Unable to retrieve task logs.');
        }
    }

    /**
     * Delete an task log entry.
     *
     * @param  int  $logId
     * @return bool
     */
    public function delete(int $logId): bool
    {
        try {
            // Find the log and delete it
            $log = TaskLog::findOrFail($logId);
            return $log->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting Issue Log: ' . $e->getMessage());
            throw new \Exception('Unable to delete task log.');
        }
    }
}
