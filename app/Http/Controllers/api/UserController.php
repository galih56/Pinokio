<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\RecordExistsException;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    
    private UserService $userService;
    
    public function __construct(UserService $userService)
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
                'users:name,email:like' => $search,
            ];
        }
        $sorts = [];
        $per_page = $request->query('per_page') ?? 0;


        $data = $this->userService->get($prepare_search, $per_page, $sorts);

        if($per_page){
            $users = [
                'data' => UserResource::collection($data->items()),  // The actual resource data
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ]
            ];
                
            return response()->json($users,200);
        }else{
            $users = UserResource::collection($data);
            return ApiResponse::sendResponse($users,'','success', 200);
        }

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        DB::beginTransaction();

        try{
            $user = $this->userService->create($request->all());

            DB::commit();
            return ApiResponse::sendResponse(new UserResource($user),'User Create Successful','success', 201);
        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    public function search(Request $request)
    {
        $keyword = $request->input('keyword');
        $data = $this->userService->searchUser($keyword);

        return ApiResponse::sendResponse(UserResource::collection($data),'', 'success', 200);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = $this->userService->getUserById($id);

        return ApiResponse::sendResponse(new UserResource($user),'', 'success', 200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateUserRequest $request)
    {
        DB::beginTransaction();
        try{
            $user = $this->userService->update($id, $request->all());

            DB::commit();
            return ApiResponse::sendResponse( $user , 'User Successful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->userService->deleteUser($id);
        
        return ApiResponse::sendResponse('User Delete Successful','',204);
    }

    public function getUserRoles()
    {
        $data = $this->userService->getUserRoles();

        return ApiResponse::sendResponse($data,'','success', 200);
    }

}
