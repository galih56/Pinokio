<?php

namespace App\Http\Controllers\api;

use App\Exceptions\RecordExistsException;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamMembersRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Services\TeamService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamController extends Controller
{
    
    private TeamService $teamService;
    
    public function __construct(TeamService $teamService)
    {
        $this->teamService = $teamService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page') ?? 0;
        $data = $this->teamService->get([], $perPage);

        if($perPage){
            $users = [
                'data' => TeamResource::collection($data->items()),  // The actual resource data
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ]
            ];
                
            return response()->json($users,200);
        }else{
            $users = TeamResource::collection($data);
            return ApiResponse::sendResponse($users,'','success', 200);
        }

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeamRequest $request)
    {
        DB::beginTransaction();
        $data = $request->all();

        try{
            $user = $this->teamService->create($data);

            DB::commit();
            return ApiResponse::sendResponse(new TeamResource($user),'Team Create Successful','success', 201);
        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = $this->teamService->getById($id);

        return ApiResponse::sendResponse(new TeamResource($user),'', 'success', 200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateTeamRequest $request)
    {
        DB::beginTransaction();
        try{
            $user = $this->teamService->update($id, $request->validated());

            DB::commit();
            return ApiResponse::sendResponse( $user , 'Team Successful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try{
            $this->teamService->delete($id);
            DB::commit();
            
            return ApiResponse::sendResponse('Team Delete Successful','',204);
            
        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    public function updateMembers(UpdateTeamMembersRequest $request, int $teamId)
    {
        DB::beginTransaction();
        try{
            $this->teamService->updateTeamMembers($teamId, $request->validated()['members']);

            DB::commit();

            return ApiResponse::sendResponse('Team Delete Successful','',204);
        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }
}
