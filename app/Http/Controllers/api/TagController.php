<?php
namespace App\Http\Controllers\api;

use App\Helpers\ApiResponse;
use App\Interfaces\TagRepositoryInterface;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\StoreTagRequest;
use App\Http\Requests\Tag\UpdateTagRequest;
use App\Http\Resources\TagResource;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    private TagRepositoryInterface $tagRepository;
    
    public function __construct(TagRepositoryInterface $tagRepository)
    {
        $this->tagRepository = $tagRepository;
    }

    public function searchTag(Request $request){
        
        $keyword = $request->query('keyword');

        $filters = [];

        if($keyword){
            $filters[] = [
                'name:like' => $keyword,
            ];
        }

        $tags = $this->tagRepository->searchTag($filters);
        
        return ApiResponse::sendResponse(TagResource::collection($tags), null, 'success', 200);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page') ?? 0;

        $filters = [];

        $data = $this->tagRepository->get($filters, $perPage, []);

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
            
            $tag = $this->tagRepository->create($data);

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
        $tag = $this->tagRepository->find($id);

        return ApiResponse::sendResponse(new TagResource($tag),'', 'success', 200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateTagRequest $request)
    {
        DB::beginTransaction();
        try{
            $tag = $this->tagRepository->update($id, $request->all());

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
        $this->tagRepository->delete($id);
        
        return ApiResponse::sendResponse('Tag Deleted Successful','',204);
    }
}
