<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Helpers\DatetimeHelper;

class FileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'url' => asset('storage/' . $this->path), // Generates full URL for the file
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'uploaded_at' => $this->uploaded_at,
        ];
    }
}
