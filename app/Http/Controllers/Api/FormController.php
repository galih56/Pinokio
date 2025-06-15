<?php
namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Form\StoreFormRequest;
use App\Http\Requests\Form\UpdateFormRequest;
use App\Http\Requests\Form\GenerateLinkRequest;
use App\Http\Requests\Form\UpdateFormLayoutRequest;
use App\Http\Resources\FormResource;
use App\Http\Resources\FormResponseResource;
use Illuminate\Support\Facades\DB;
use App\Services\Forms\FormResponseService;
use App\Services\Forms\FormService;
use App\Services\HashidService;

class FormController extends Controller
{
    private FormService $formService;
    private FormResponseService $formResponseService;
    
    public function __construct(FormService $formService, FormResponseService $formResponseService)
    {
        $this->formService = $formService;
        $this->formResponseService = $formResponseService;
    }

    public function getFormWithLayout($id){
        $form = $this->formService->getFormWithLayout($id);

        return ApiResponse::sendResponse(new FormResource($form),'', 'success', 200);
    }

    public function generateLink(GenerateLinkRequest $request, $id) {
        
        DB::beginTransaction();
        try{
            $data = $request->all();
                
            $form = $this->formService->getById($id);
            $token = $this->formService->generateToken($form, $data);

            DB::commit();
            
            if(empty($token)){
                return ApiResponse::sendResponse(null,'Failed to generate link','error', 500);

            }

            $hashid = new HashIdService();
            return ApiResponse::sendResponse([
                'link' => env('APP_URL')."/forms/".$hashid->encode($form->id)."/fill"
            ],'Link generated successfully','success', 201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
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
            return ApiResponse::sendResponse($form,'Form Created Successfully','success', 201);

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
            return ApiResponse::sendResponse( $form , 'Form Update Successful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }


    public function updateFormLayout($id, UpdateFormLayoutRequest $request)
    {
        DB::beginTransaction();
        try{
            $form = $this->formService->updateFormLayout($id, $request->all());

            DB::commit();
            return ApiResponse::sendResponse( $form , 'Form Update Successful','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }
    
    public function getFormResponses(Request $request, $id)
    {
        $perPage = $request->query('per_page', 0);
        $search = $request->query('search');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $identifier = $request->query('identifier');

        $filters = [];

        if ($search) {
            $searchFilters = [
                'with:entries.formField:label:like' => $search,
                'with:entries:value:like' => $search,
                // 'with:form:title,description:like' => $search,
                'with:submittedByUser:name,email:like' => $search,
            ];
            $filters[] = $searchFilters;
        }

        // Additional filters (AND conditions - same group)
        $additionalFilters = [];
        
        if ($dateFrom) {
            $additionalFilters['form_submissions:submitted_at:>='] = $dateFrom;
        }

        if ($dateTo) {
            $additionalFilters['form_submissions:submitted_at:<='] = $dateTo;
        }

        if ($identifier) {
            $additionalFilters['with:attempts:identifier:equal'] = $identifier;
        }

        if (!empty($additionalFilters)) {
            $filters[] = $additionalFilters;
        }

        $data = $this->formResponseService->get($id, $filters, $perPage);

        return ApiResponse::sendResponse(
            FormResponseResource::collection($data),
            null,
            'success',
            200
        );
    }


    public function storeFormResponse($id, Request $request)
    {
        DB::beginTransaction();
        try{
            $form = $this->formResponseService->store($id, $request->all());

            DB::commit();
            return ApiResponse::sendResponse( $form , 'Form entry is stored','success',201);

        }catch(\Exception $ex){
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->formService->delete($id);
        
        return ApiResponse::sendResponse('Form Delete Successful','',204);
    }
}

