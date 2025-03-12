<?php

namespace App\Http\Controllers\api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRole\StoreUserRoleRequest;
use App\Http\Requests\UserRole\UpdateUserRoleRequest;
use App\Http\Resources\UserRoleResource;
use Illuminate\Support\Facades\DB;

class UserRoleController extends Controller
{
    
    private UserRoleService $userService;
    
    public function __construct(UserRoleService $userService)
    {
        $this->userService = $userService;
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
                'user_roles:name:like' => $search,
            ];
        }
        $sorts = [];
        $per_page = $request->query('per_page') ?? 0;


        $data = $this->userService->get($prepare_search, $per_page, $sorts);

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

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRoleRequest $request)
    {
        DB::beginTransaction();

        try{
            $user = $this->userService->create($request->all());

            DB::commit();
            return ApiResponse::sendResponse(new UserRoleResource($user),'UserRole Create Successful','success', 201);
        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    public function search(Request $request)
    {
        $keyword = $request->input('keyword');
        $data = $this->userService->searchUserRole($keyword);

        return ApiResponse::sendResponse(UserRoleResource::collection($data),'', 'success', 200);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = $this->userService->getUserRoleById($id);

        return ApiResponse::sendResponse(new UserRoleResource($user),'', 'success', 200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateUserRoleRequest $request)
    {
        DB::beginTransaction();
        try{
            $user = $this->userService->update($id, $request->all());

            DB::commit();
            return ApiResponse::sendResponse( $user , 'UserRole Successful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->userService->deleteUserRole($id);
        
        return ApiResponse::sendResponse('UserRole Delete Successful','',204);
    }

    public function getUserRoleRoles()
    {
        $data = $this->userService->getUserRoleRoles();

        return ApiResponse::sendResponse($data,'','success', 200);
    }

}
