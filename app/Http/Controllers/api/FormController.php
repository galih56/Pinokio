<?php
namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Form\StoreFormRequest;
use App\Http\Requests\Form\UpdateFormRequest;
use App\Http\Resources\FormResource;
use Illuminate\Support\Facades\DB;
use App\Services\Forms\FormService;

class FormController extends Controller
{
    private FormService $formService;
    
    public function __construct(FormService $formService)
    {
        $this->formService = $formService;
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
                'forms:title,description:like' => $search,
            ];
        }


        $data = $this->formService->get($prepare_search, $perPage, []);

        if($perPage){
            $forms = [
                'data' => FormResource::collection($data->items()),  // The actual resource data
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total_count' => $data->total(),
                    'total_pages' => $data->lastPage(),
                ]
            ];
                
            return response()->json($forms,200);
        }else{
            $forms = FormResource::collection($data);
            return ApiResponse::sendResponse($forms,'','success', 200);
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
            
            $form = $this->formService->create($data);

            DB::commit();
            return ApiResponse::sendResponse($form,'Form Created Successful','success', 201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $form = $this->formService->getById($id);

        return ApiResponse::sendResponse(new FormResource($form),'', 'success', 200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateFormRequest $request)
    {
        DB::beginTransaction();
        try{
            $form = $this->formService->update($id, $request->all());

            DB::commit();
            return ApiResponse::sendResponse( $form , 'Form Succesdsful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->formService->deleteForm($id);
        
        return ApiResponse::sendResponse('Form Deleted Successful','',204);
    }
}
