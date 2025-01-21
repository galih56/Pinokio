<?php
namespace App\Http\Controllers\api;

use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Issue\StoreIssueRequest;
use App\Http\Requests\Issue\UpdateIssueRequest;
use App\Http\Resources\IssueResource;
use Illuminate\Support\Facades\DB;
use App\Services\IssueService;

class IssueController extends Controller
{
    private IssueService $issueService;

    public function __construct(IssueService $issueService)
    {
        $this->issueService = $issueService;
    }

    public function searchIssue(Request $request)
    {
        $keyword = $request->query('keyword');

        $issues = $this->issueService->searchIssues($keyword);

        return ApiResponse::sendResponse(IssueResource::collection($issues), null, 'success', 200);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page') ?? 0;

        $data = $this->issueService->getIssues($perPage);

        if ($perPage) {
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

    /**
     * Store a newly created resource in storage.
     */
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->issueService->deleteIssue($id);

        return ApiResponse::sendResponse('Issue Delete Successful', '', 204);
    }
}
