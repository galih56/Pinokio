<?php
namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\CloseTaskRequest;
use App\Http\Requests\Task\GetPublicTasksRequest;
use App\Http\Requests\Task\ClosePublicTaskRequest;
use App\Http\Requests\Task\StorePublicTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Http\Resources\FileResource;
use Illuminate\Support\Facades\DB;
use App\Services\TaskService;

class TaskController extends Controller
{
    private TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function searchTask(Request $request)
    {
        $keyword = $request->query('keyword');

        $tasks = $this->taskService->searchTasks($keyword);

        return ApiResponse::sendResponse(TaskResource::collection($tasks), null, 'success', 200);
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');


        $prepare_search = [];
        if ($search) {
            $prepare_search[] = [
                'tasks:title:like' => $search,
                'tasks:description:like' => $search,
                'with:tags:name:like' => $search,
            ];
        }

        $per_page = $request->query('per_page') ?? 0;

        $data = $this->taskService->get($prepare_search, $per_page);

        if ($per_page) {
            $tasks = [
                'data' => TaskResource::collection($data->items()),  
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ],
            ];
            return response()->json($tasks, 200);
        } else {
            $tasks = TaskResource::collection($data);
            return ApiResponse::sendResponse($tasks, '', 'success', 200);
        }
    }

    public function store(StoreTaskRequest $request)
    {
        try {
            $task = $this->taskService->createTask($request->validated());

            return ApiResponse::sendResponse($task, 'Task Create Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $task = $this->taskService->getTaskById($id);

        return ApiResponse::sendResponse(new TaskResource($task), '', 'success', 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateTaskRequest $request)
    {
        try {
            $task = $this->taskService->updateTask($id, $request->validated());

            return ApiResponse::sendResponse($task, 'Task Update Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    public function closeTask($id, CloseTaskRequest $request)
    {
        try {
            $data = array_merge($request->validated(), ['taskr_type' => 'User']);
            $task = $this->taskService->closeTask($id, $data);

            return ApiResponse::sendResponse($task, 'Task Close Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->taskService->deleteTask($id);

        return ApiResponse::sendResponse('Task Delete Successful', '', 204);
    }

    public function getFiles($id){
        $files = $this->taskService->getFiles($id);
        
        return ApiResponse::sendResponse(FileResource::collection($files), '', 'success', 200);
    }
}
