<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;

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
     * @param mixed $uploader
     * @return File|array
     * @throws Exception
     */
    public function upload($files, string $directory = 'uploads', $uploader = null, $storeToFileTable = true)
    {
        // Handle single file upload
        if ($files instanceof UploadedFile) {
            return $this->uploadSingleFile($files, $directory, $uploader, $storeToFileTable);
        }

        // Handle multiple file uploads
        if (is_array($files)) {
            return $this->uploadMultipleFiles($files, $directory, $uploader, $storeToFileTable);
        }

        throw new Exception('Invalid file input provided');
    }

    /**
     * Upload a single file
     */
    protected function uploadSingleFile(UploadedFile $file, string $directory, $uploader = null, $storeToFileTable=true): File | string
    {
        if (!$file->isValid()) {
            throw new Exception('Invalid file upload: ' . $file->getErrorMessage());
        }

        try {
            $filename = $this->generateUniqueFilename($file);
            $path = $file->storeAs($directory, $filename, $this->disk);

            if($storeToFileTable === false){
                return $path;
            }
            return $this->createFileRecord($file, $path, $uploader);
        } catch (Exception $e) {
            throw new Exception('Failed to upload file: ' . $e->getMessage());
        }
    }

    /**
     * Upload multiple files
     */
    protected function uploadMultipleFiles(array $files, string $directory, $uploader = null, $storeToFileTable=true): array
    {
        $uploadedFiles = [];
        $errors = [];

        foreach ($files as $index => $file) {
            if (!$file instanceof UploadedFile) {
                $errors[] = "File at index {$index} is not a valid upload";
                continue;
            }

            try {
                $uploadedFiles[] = $this->uploadSingleFile($file, $directory, $uploader);
            } catch (Exception $e) {
                $errors[] = "File at index {$index}: " . $e->getMessage();
            }
        }

        if (!empty($errors) && empty($uploadedFiles)) {
            throw new Exception('All file uploads failed: ' . implode(', ', $errors));
        }

        return $uploadedFiles;
    }

    /**
     * Create file record in database
     */
    protected function createFileRecord(UploadedFile $file, string $path, $uploader = null): File
    {
        $fileData = [
            'path' => $path,
            'name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_at' => now(),
        ];

        if ($uploader) {
            $fileData['uploader_id'] = $uploader->id;
            $fileData['uploader_type'] = get_class($uploader);
        }

        return File::create($fileData);
    }

    /**
     * Generate a unique filename.
     */
    protected function generateUniqueFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        return Str::random(20) . '.' . $extension;
    }

    /**
     * Delete a file and its record
     */
    public function delete(File $file): bool
    {
        try {
            // Delete physical file
            if (Storage::disk($this->disk)->exists($file->path)) {
                Storage::disk($this->disk)->delete($file->path);
            }

            // Delete database record
            return $file->delete();
        } catch (Exception $e) {
            throw new Exception('Failed to delete file: ' . $e->getMessage());
        }
    }

    /**
     * Get file URL
     */
    public function getUrl(File | string $file): string
    {
        if(is_string($file)) return Storage::disk($this->disk)->url($file);
        return Storage::disk($this->disk)->url($file->path);
    }

    /**
     * Validate file type and size
     */
    public function validateFile(UploadedFile $file, array $allowedMimes = [], int $maxSize = null): bool
    {
        if (!empty($allowedMimes) && !in_array($file->getMimeType(), $allowedMimes)) {
            throw new Exception('File type not allowed. Allowed types: ' . implode(', ', $allowedMimes));
        }

        if ($maxSize && $file->getSize() > $maxSize) {
            throw new Exception('File size exceeds maximum allowed size of ' . ($maxSize / 1024) . 'KB');
        }

        return true;
    }

    /**
     * Upload image with validation
     */
    public function uploadImage($file, string $directory = 'images', $uploader = null, ?int $maxSize = 2048000, $storeToFileTable=true): File | string
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
        
        if ($file instanceof UploadedFile) {
            $this->validateFile($file, $allowedMimes, $maxSize);
        }

        return $this->upload($file, $directory, $uploader, $storeToFileTable);
    }
    
    /**
     * Copy a static file between disks (default local/private to local/private)
     *
     * @param string $sourcePath   Path relative to source disk root
     * @param string $targetPath   Path relative to target disk root (including folder and filename)
     * @param string $sourceDisk   Source disk (default: local)
     * @param string $targetDisk   Target disk (default: local)
     * @param bool $overwrite      If true, will overwrite existing file
     * @return string              Path of copied file (relative to target disk root)
     * @throws Exception           If source file does not exist
     */
    public function copyFile(
        string $sourcePath,
        string $targetPath,
        string $sourceDisk = 'local',
        string $targetDisk = 'local',
        bool $overwrite = false
    ): string
    {
        // Normalize paths
        $sourcePath = ltrim($sourcePath, '/');
        $targetPath = ltrim($targetPath, '/');

        // Check source exists
        if (!Storage::disk($sourceDisk)->exists($sourcePath)) {
            throw new Exception("Source file not found: disk=$sourceDisk path=$sourcePath");
        }

        // If target exists and overwrite = false → skip
        if (!$overwrite && Storage::disk($targetDisk)->exists($targetPath)) {
            return $targetPath;
        }

        // Make sure target folder exists
        Storage::disk($targetDisk)->makeDirectory(dirname($targetPath));

        // Copy file
        Storage::disk($targetDisk)->put(
            $targetPath,
            Storage::disk($sourceDisk)->get($sourcePath)
        );

        return $targetPath;
    }

}