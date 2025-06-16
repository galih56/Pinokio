<?php 

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\File;
use Illuminate\Http\Request;
use App\Http\Resources\FileResource;
use App\Http\Requests\File\GetFileRequest;

class FileController extends Controller
{
    /**
     * Fetch all files or files related to a specific activity.
     */
    public function index(GetFileRequest $request)
    {
        // Check if a specific model is provided via the 'related_type' and 'related_id' query parameters
        $query = File::query();

        if ($request->has('related_type') && $request->has('related_id')) {
            // Fetch files related to a specific activity (issue, task, project)
            $query->whereHas('related', function($query) use ($request) {
                $query->where('related_type', $request->get('related_type'))
                      ->where('related_id', $request->get('related_id'));
            });
        }

        // Return all files if no specific relation is provided
        return FileResource::collection($query->get());
    }
}
