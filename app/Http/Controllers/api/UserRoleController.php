<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRole\StoreUserRoleRequest;
use App\Http\Requests\UserRole\UpdateUserRoleRequest;
use App\Http\Resources\UserRoleResource;
use Illuminate\Support\Facades\DB;
use App\Services\Authorizations\UserRoleService;
use App\Helpers\ApiResponse;
use Auth;

class UserRoleController extends Controller
{
    
    private UserRoleService $userRoleService;
    
    public function __construct(UserRoleService $userRoleService)
    {
        $this->userRoleService = $userRoleService;
    }

    public function index(Request $request)
    {
        $search = $request->query('search');
        $prepare_search = [];
        if ($search) {
            $prepare_search[] = [
                'user_roles:name:like' => $search,
            ];
        }
        $sorts = [];
        $per_page = $request->query('per_page') ?? 0;


        $data = $this->userRoleService->get($prepare_search, $per_page, $sorts);

        if($per_page){
            $users = [
                'data' => UserRoleResource::collection($data->items()),  // The actual resource data
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ]
            ];
                
            return response()->json($users,200);
        }else{
            $users = UserRoleResource::collection($data);
            return ApiResponse::sendResponse($users,'','success', 200);
        }

    }

    public function store(StoreUserRoleRequest $request)
    {
        DB::beginTransaction();

        try{
            $user = $this->userRoleService->create($request->all());

            DB::commit();
            return ApiResponse::sendResponse(new UserRoleResource($user),'UserRole Create Successful','success', 201);
        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    public function search(Request $request)
    {
        $keyword = $request->input('keyword');
        $data = $this->userRoleService->searchUserRole($keyword);

        return ApiResponse::sendResponse(UserRoleResource::collection($data),'', 'success', 200);
    }

    public function show($id)
    {
        $user = $this->userRoleService->getById($id);

        return ApiResponse::sendResponse(new UserRoleResource($user),'', 'success', 200);
    }

    public function update($id, UpdateUserRoleRequest $request)
    {
        DB::beginTransaction();
        try{
            $user = $this->userRoleService->update($id, $request->all());

            DB::commit();
            return ApiResponse::sendResponse( $user , 'User Role Update Successful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->userRoleService->delete($id);
        
        return ApiResponse::sendResponse('UserRole Delete Successful','',204);
    }

    public function getUserRoles()
    {
        $userId = Auth::id();
        $data = $this->userRoleService->getUserRole($userId);

        return ApiResponse::sendResponse($data,'','success', 200);
    }

}
