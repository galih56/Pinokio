<?php
namespace App\Http\Controllers\api;

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
use App\Http\Resources\FileResource;
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
            $issue = $this->issueService->createIssue($request->validated());

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
        $issue = $this->issueService->getIssueById($id);

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
                'issues.title:like' => $search,
                'issues.description:like' => $search,
                'with:tags.name:like' => $search,
                'with:guestIssuer.email:like' => $search,
            ];
        }

        $per_page = $request->query('per_page') ?? 0;

        $data = $this->issueService->getAllIssues($prepare_search, $per_page);

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
        try {
            $issue = $this->issueService->createIssue($request->validated());

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
        $issue = $this->issueService->getIssueById($id);

        return ApiResponse::sendResponse(new IssueResource($issue), '', 'success', 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateIssueRequest $request)
    {
        try {
            $issue = $this->issueService->updateIssue($id, $request->validated());

            return ApiResponse::sendResponse($issue, 'Issue Update Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    public function closePublicIssue($id, ClosePublicIssueRequest $request)
    {
        try {
            $data = array_merge($request->validated(), ['issuer_type' => 'GuestIssuer']);
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
        $this->issueService->deleteIssue($id);

        return ApiResponse::sendResponse('Issue Delete Successful', '', 204);
    }

    public function getFiles($id){
        $files = $this->issueService->getFiles($id);
        
        return ApiResponse::sendResponse(FileResource::collection($files), '', 'success', 200);
    }

    public function getIssueLogs($id){

    }

}
