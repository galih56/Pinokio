<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Models\File;
use Illuminate\Support\Facades\Log;
use App\Models\GuestTaskr;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Helpers\DatetimeHelper;
use App\Services\Logs\TaskLogService;
use App\Helpers\QueryProcessor;
use Auth;


class TaskService
{
    protected $model;
    protected $fileService;
    protected $taskLogService;

    public function __construct(
        Task $model,
        TaskLogService $taskLogService,
        FileService $fileService, 
    )
    {
        $this->model = $model;
        $this->guestTaskrService = $guestTaskrService;
        $this->fileService = $fileService;
        $this->taskLogService = $taskLogService;
    }

    
    public function getRelatedData(array $additionals = [])
    {
        $basic_relations = [
            'tags',
            'files',
        ];

        return array_merge($basic_relations, $additionals);
    }

    
    public function create(array $data): Task
    {
        try {
            $data = $this->prepareTaskData($data);
    
            $data['created_by'] = Auth::id();
    
            $data['status'] = 'idle';

            $this->model = $this->model->create($data);
    
            // Use FileService to upload files and get an array of File models
            $uploadedFiles = $this->fileService->upload($data['files'] ?? [], 'task_files' ,$taskr);
    
            // Attach files to the task if any files are uploaded
            if (!empty($uploadedFiles)) {
                $this->attachFilesToTask( $this->model->id, $uploadedFiles);
            }
    
            // Attach tags to the task if any tag IDs are provided
            $tagIds = $data['tag_ids'] ?? (isset($data['tag_id']) ? [$data['tag_id']] : []);
            if (!empty($tagIds)) {
                $this->attachTags( $this->model->id, $tagIds);
            }
    
            // Refresh and load relationships
            $this->model->refresh();
            $this->model->load( $this->getRelatedData());
    
            $this->taskLogService->create([
                'task_id' =>  $this->model->id,
                'user_id' => $taskr->id,
                'user_type' => $taskrType,
                'action' => 'created',
                'action_details' => json_encode(['description' => 'Task created']),
            ]);
            return $this->model;
        } catch (\Exception $e) {
            Log::error('Error creating task: ' . $e->getMessage());
            throw $e;
        }
    }

    public function update(int $id, array $data): Task
    {
        try {
            $data = $this->prepareTaskData($data);
                
            $this->model = $this->model->find($id);
            $task = $this->model->update($data);

            $tagIds = $data['tag_ids'] ?? ($data['tag_id'] ? [$data['tag_id']] : []);
            if (!empty($tagIds)) {
                $this->attachTags($task->id, $tagIds);
            }

            $task->refresh();
            $task->load($this->getRelatedData());

            $this->taskLogService->create([
                'task_id' => $this->model->id,
                'user_id' => isset($data['user_id']) ? $data['user_id'] : null,
                'action' => 'updated',
                'action_details' => json_encode(['updated_fields' => array_keys($data)]),
            ]);
            return $task;
        } catch (\Exception $e) {
            Log::error('Error updating task: ' . $e->getMessage());
            throw $e;
        }
    }


    
    public function updateStatus(int $id, array $data): Task
    {
        try {
            $taskr = null;
            if ($data['taskr_type'] == 'guest_taskr') {
                // If the user is a guest, create or fetch the GuestTaskr
                $taskr =  $this->guestTaskrService->getOrCreateGuestTaskr($data['email'], $data['name'], $data['ip_address']);
                $taskrType = 'guest_taskr';
                                
                $this->model = $this->model->where('id',$id)->where('taskr_type', $taskrType)->firstOrFail();
                $this->model->status = 'closed';
                $this->model->save();
            } else {
                // If the user is authenticated, set the taskr as the User
                $taskr = auth()->user();
                $taskrType = 'user';

                $this->model = $this->model->find($id);
                $this->model->status = $data['status'];
                $this->model->save();
            }
            
            $this->taskLogService->create([
                'task_id' => $this->model->id,
                'user_id' => $taskr->id,
                'user_type' => $taskrType,
                'action' => 'status_change',
                'action_details' => json_encode(['previous_status' =>  $this->model->getOriginal('status'), 'new_status' => 'closed']),
            ]);
            return $this->model;
        } catch (\Exception $e) {
            Log::error('Error closing task: ' . $e->getMessage());
            throw $e;
        }
    }


    public function delete(int $id): bool
    {
        try {
            $this->model = $this->model->find($id);
            if (!$this->model) {
                throw new Exception("Task not found.");
            }

            $this->model->tags()->detach();
            $deleted = $this->model->delete($id);
            $this->taskLogService->create([
                'user_id' => auth()->id(), 
                'user_type' => 'user',
                'action' => 'deleted',
                'action_details' => json_encode(['description' => 'Task "'.$task->title.'" is deleted']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting task: ' . $e->getMessage());
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

    public function getPublicTasks(array $filters = [], int $perPage = 0, array $sorts = [], $email = ''): Collection | LengthAwarePaginator
    {
        $taskr =  $this->guestTaskrService->getByEmail($email);
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);

        $query = $query->where('tasks.taskr_type', 'guest_taskr');
        
        $query->with($this->getRelatedData());
        
        return $query->paginate($perPage);
    }

    public function getById(int $id): ?Task
    {
        return Task::with($this->getRelatedData())->findOrFail($id);
    }

    public function getFiles(int $id) {
        $task = Task::with('files')->find($id);

        return $task->files;
    }

    /**
     * Prepares task data before creation or update.
     *
     * @param array $data
     * @return array
     */
    protected function prepareTaskData(array $data): array
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

    public function attachFilesToTask($id, $files): void
    {
        $this->model = $this->model->with('files')->find($id);
        if (!is_array($files)) {
            $files = [$files];
        }
        foreach ($files as $file) {
            // Ensure $file is a File model, and attach the file ID to the task
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
