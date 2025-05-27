<?php
namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Form\StoreFormRequest;
use App\Http\Requests\Form\UpdateFormRequest;
use App\Http\Resources\FormResource;
use Illuminate\Support\Facades\DB;
use App\Services\FormService;

class FormController extends Controller
{
    private FormService $tagService;
    
    public function __construct(FormService $tagService)
    {
        $this->tagService = $tagService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page') ?? 0;

        $search = $request->query('search');


        $prepare_search = [];
        if ($search) {
            $prepare_search[] = [
                'tags:name:like' => $search,
            ];
        }

        if(empty(auth()->check())){
            $prepare_search[] = [
                'tags:is_public:=' => true,
            ];
        }

        $data = $this->tagService->get($prepare_search, $perPage, []);

        if($perPage){
            $tags = [
                'data' => FormResource::collection($data->items()),  // The actual resource data
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ]
            ];
                
            return response()->json($tags,200);
        }else{
            $tags = FormResource::collection($data);
            return ApiResponse::sendResponse($tags,'','success', 200);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFormRequest $request)
    {
        DB::beginTransaction();
        try{
            $data = $request->all();
            
            $tag = $this->tagService->create($data);

            DB::commit();
            return ApiResponse::sendResponse($tag,'Form Created Successful','success', 201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tag = $this->tagService->getById($id);

        return ApiResponse::sendResponse(new FormResource($tag),'', 'success', 200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateFormRequest $request)
    {
        DB::beginTransaction();
        try{
            $tag = $this->tagService->update($id, $request->all());

            DB::commit();
            return ApiResponse::sendResponse( $tag , 'Form Succesdsful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->tagService->deleteForm($id);
        
        return ApiResponse::sendResponse('Form Deleted Successful','',204);
    }
}
