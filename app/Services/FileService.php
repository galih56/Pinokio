<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileService
{
    protected string $disk;

    public function __construct(string $disk = 'public')
    {
        $this->disk = $disk;
    }
    
    /**
     * Upload a file or an array of files to the specified storage disk and return an array of File models.
     *
     * @param UploadedFile|array $files
     * @param string $directory
     * @return File|array
     */
    public function upload($files, string $directory = 'uploads')
    {
        // If it's a single file, make it an array to unify the logic
        if (!$files instanceof \Illuminate\Http\UploadedFile) {
            $files = (array) $files; // Convert to array if it's not already an array
        }

        $uploadedFiles = [];

        foreach ($files as $file) {
            if ($file->isValid()) {
                $filename = $this->generateUniqueFilename($file);
                $path = $file->storeAs($directory, $filename, $this->disk);

                // Create the File model
                $newFile = File::create([
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'uploaded_at' => now(),
                ]);

                // Store the file model in the result array
                $uploadedFiles[] = $newFile;
            }
        }

        // If only one file was uploaded, return the single File model
        if (count($uploadedFiles) === 1) {
            return $uploadedFiles[0];
        }

        return $uploadedFiles; // Return an array of File models
    }
    /**
     * Generate a unique filename.
     *
     * @param UploadedFile $file
     * @return string
     */
    protected function generateUniqueFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        return Str::random(20) . '.' . $extension;
    }
}
