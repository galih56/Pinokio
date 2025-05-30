<?php
namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Issue\StoreIssueRequest;
use App\Http\Requests\Issue\UpdateIssueStatusRequest;
use App\Http\Requests\Issue\GetPublicIssuesRequest;
use App\Http\Requests\Issue\ClosePublicIssueRequest;
use App\Http\Requests\Issue\StorePublicIssueRequest;
use App\Http\Requests\Issue\UpdateIssueRequest;
use App\Http\Resources\IssueResource;
use App\Http\Resources\Logs\IssueLogResource;
use Illuminate\Support\Facades\DB;
use App\Services\IssueService;
use App\Services\Logs\IssueLogService;

class IssueController extends Controller
{
    private IssueService $issueService;
    private IssueLogService $issueLogService;

    public function __construct(IssueService $issueService, IssueLogService $issueLogService)
    {
        $this->issueService = $issueService;
        $this->issueLogService = $issueLogService;
    }

    public function searchIssue(Request $request)
    {
        $keyword = $request->query('keyword');

        $issues = $this->issueService->searchIssues($keyword);

        return ApiResponse::sendResponse(IssueResource::collection($issues), null, 'success', 200);
    }

    public function storePublicIssue(StorePublicIssueRequest $request)
    {
        try {
            $issue = $this->issueService->create($request->validated());

            return ApiResponse::sendResponse($issue, 'Issue Create Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    public function getPublicIssues(GetPublicIssuesRequest $request){
        $search = $request->query('search');
        $email = $request->query('email');


        $prepare_search = [];
        if ($search) {
            $prepare_search[] = [
                'issues:title,description:like' => $search,
                'with:tags:name:like' => $search,
            ];
        }
        $prepare_search[] = [
            'with:issuer:email:=' => $email,
        ];
        $sorts = [];
        $per_page = $request->query('per_page') ?? 0;

        $data = $this->issueService->getPublicIssues($prepare_search, $per_page, $sorts, $email);

        if ($per_page) {
            $issues = [
                'data' => IssueResource::collection($data->items()),
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ],
            ];
            return response()->json($issues, 200);
        } else {
            $issues = IssueResource::collection($data);
            return ApiResponse::sendResponse($issues, '', 'success', 200);
        }
    }

    public function getPublicIssue($id)
    {
        $issue = $this->issueService->getById($id);

        return ApiResponse::sendResponse(new IssueResource($issue), '', 'success', 200);
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
                'issues:title:like' => $search,
                'issues:description:like' => $search,
                'with:tags:name:like' => $search,
                'with:issuer:email:like' => $search,
            ];
        }

        $per_page = $request->query('per_page') ?? 0;

        $data = $this->issueService->get($prepare_search, $per_page);

        if ($per_page) {
            $issues = [
                'data' => IssueResource::collection($data->items()),  // The actual resource data
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ],
            ];
            return response()->json($issues, 200);
        } else {
            $issues = IssueResource::collection($data);
            return ApiResponse::sendResponse($issues, '', 'success', 200);
        }
    }

    public function store(StoreIssueRequest $request)
    {
        DB::beginTransaction();
        try {
            $issue = $this->issueService->create($request->all());

            return ApiResponse::sendResponse($issue, 'Issue Create Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $issue = $this->issueService->getById($id);

        return ApiResponse::sendResponse(new IssueResource($issue), '', 'success', 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateIssueRequest $request)
    {
        try {
            $issue = $this->issueService->update($id, $request->validated());

            return ApiResponse::sendResponse($issue, 'Issue Update Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    public function closePublicIssue($id, ClosePublicIssueRequest $request)
    {
        try {
            $data = array_merge($request->validated(), ['issuer_type' => 'guest_issuer']);
            $issue = $this->issueService->updateStatus($id, $data);

            return ApiResponse::sendResponse($issue, 'Issue Close Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    public function updateIssueStatus($id, UpdateIssueStatusRequest $request)
    {
        try {
            $data = array_merge($request->validated(), ['issuer_type' => 'User']);
            $issue = $this->issueService->updateStatus($id, $data);

            return ApiResponse::sendResponse($issue, 'Issue Close Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->issueService->delete($id);

        return ApiResponse::sendResponse('Issue Delete Successful', '', 204);
    }

    public function getFiles($id){
        $files = $this->issueService->getFiles($id);
        
        return ApiResponse::sendResponse(IssueLogResource::collection($files), '', 'success', 200);
    }

    public function getIssueLogs($id, Request $request){
        
        $search = $request->query('search');


        $prepare_search = [];
        if ($search) {
            $prepare_search[] = [
                'issue.title:like' => $search,
            ];
        }

        $per_page = $request->query('per_page') ?? 0;

        $data = $this->issueLogService->getIssueLogs($id,$prepare_search, $per_page);

        if ($per_page) {
            $logs = [
                'data' => IssueLogResource::collection($data->items()),  // The actual resource data
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ],
            ];
            return response()->json($logs, 200);
        } else {
            $logs = $this->isseLogService->getIssueLogs($id);
            return ApiResponse::sendResponse(IssueLogResource::collection($logs), '', 'success', 200);
        
        }
    }

}
