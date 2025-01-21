<?php

namespace App\Services;

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
     * Upload a file to the specified storage disk.
     *
     * @param UploadedFile $file
     * @param string $directory
     * @return string The path of the uploaded file
     */
    public function upload(UploadedFile $file, string $directory = 'uploads'): string
    {
        $filename = $this->generateUniqueFilename($file);
        $path = $file->storeAs($directory, $filename, $this->disk);
        return $path;
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

    /**
     * Get the URL of a file.
     *
     * @param string $path
     * @return string
     */
    public function getUrl(string $path): string
    {
        if(Storage::disk($this->disk)->exists($path)){
            return Storage::disk($this->disk)->url($path);
        }else return '';
    }

    /**
     * Delete a file from storage.
     *
     * @param string $path
     * @return bool
     */
    public function delete(string $path): bool
    {
        return Storage::disk($this->disk)->delete($path);
    }

    /**
     * List all files in a given directory.
     *
     * @param string $directory
     * @return array
     */
    public function listFiles(string $directory = 'uploads'): array
    {
        return Storage::disk($this->disk)->files($directory);
    }

    /**
     * Check if a file exists.
     *
     * @param string $path
     * @return bool
     */
    public function exists(string $path): bool
    {
        return Storage::disk($this->disk)->exists($path);
    }

    /**
     * Download a file.
     *
     * @param string $path
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function download(string $path)
    {
        return Storage::disk($this->disk)->download($path);
    }
}
