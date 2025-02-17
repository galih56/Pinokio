<?php
namespace App\Http\Controllers\api;

use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\StoreTagRequest;
use App\Http\Requests\Tag\UpdateTagRequest;
use App\Http\Resources\TagResource;
use Illuminate\Support\Facades\DB;
use App\Services\TagService;

class TagController extends Controller
{
    private TagService $tagService;
    
    public function __construct(TagService $tagService)
    {
        $this->tagService = $tagService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page') ?? 0;

        $filters = [];

        $data = $this->tagService->getAllTags($filters, $perPage, []);

        if($perPage){
            $tags = [
                'data' => TagResource::collection($data->items()),  // The actual resource data
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ]
            ];
                
            return response()->json($tags,200);
        }else{
            $tags = TagResource::collection($data);
            return ApiResponse::sendResponse($tags,'','success', 200);
        }

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTagRequest $request)
    {
        DB::beginTransaction();
        try{
            $data = $request->all();
            
            $tag = $this->tagService->create($data);

            DB::commit();
            return ApiResponse::sendResponse($tag,'Tag Created Successful','success', 201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tag = $this->tagService->getTagById($id);

        return ApiResponse::sendResponse(new TagResource($tag),'', 'success', 200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateTagRequest $request)
    {
        DB::beginTransaction();
        try{
            $tag = $this->tagService->update($id, $request->all());

            DB::commit();
            return ApiResponse::sendResponse( $tag , 'Tag Succesdsful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->tagService->delete($id);
        
        return ApiResponse::sendResponse('Tag Deleted Successful','',204);
    }
}
