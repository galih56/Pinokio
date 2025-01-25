<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Issue;
use App\Models\Task;
use App\Models\File;

class FileAssociationTest extends TestCase
{
    use RefreshDatabase;

    public function test_files_can_be_associated_with_issues_and_tasks()
    {
        // Create an Issue and a Task
        $issue = Issue::create(['title' => 'Bug Report', 'due_date' => '2025-01-25 14:55:41']);
        // $task = Task::create(['title' => 'Task 1']);

        // Create Files
        $file1 = File::create(['name' => 'document.pdf', 'path' => 'document1.pdf', 'size' => 1500, 'mime_type' => 'application/pdf']);
        $file2 = File::create(['name' => 'image1.png', 'path' => 'image1.png', 'size' => 2000, 'mime_type' => 'image/png']);
        $file3 = File::create(['name' => 'image2.png', 'path' => 'image2.png', 'size' => 2000, 'mime_type' => 'image/png']);

        // Associate files with Issue and Task
        $issue->files()->saveMany([$file1, $file2]);
        $issue->files()->attach($file3->id, [
            'related_type' => Issue::class,
            'related_id' => $issue->id,
        ]);
        // $task->files()->save($file2);

        // Reload relationships
        $issue->load('files');
        // $task->load('files');

        // Assert Files are associated correctly
        $this->assertTrue($issue->files->contains($file1));
        $this->assertTrue($issue->files->contains($file2));
        $this->assertTrue($issue->files->contains($file3));
    }

    public function test_files_can_be_retrieved_from_parent()
    {
        // Create a Task
        $issue = Issue::create(['title' => 'Bug Report', 'due_date' => '2025-01-25 14:55:41']);

        // Create a File and associate it with the Task
        $file = File::create(['name' => 'task_doc.pdf', 'path' => 'document1.pdf', 'size' => 1500, 'mime_type' => 'application/pdf']);
        $issue->files()->save($file);

        // Reload relationship
        $issue->load('files');

        // Assert the issue has the File
        $this->assertCount(1, $issue->files);
        $this->assertEquals('document1.pdf', $issue->files->first()->path);
    }

    public function test_file_can_retrieve_parent_model()
    {
        // Create an Issue
        $issue = Issue::create(['title' => 'Bug Report', 'due_date' => '2025-01-25 14:55:41']);

        // Create a File and associate it with the Issue
        $file = File::create(['name' => 'issue_doc.pdf', 'path' => 'issue_document.pdf', 'size' => 1500, 'mime_type' => 'application/pdf']);
        $issue->files()->save($file);

        // Reload relationship
        $file->load('related');
        // Assert the File can retrieve its parent Issue
        $this->assertTrue($issue->files->contains($file));

        $this->assertTrue($file->related->contains(function ($related) use($issue) {
            return $related instanceof Issue && $related->id === $issue->id; // Check if it matches the expected Issue
        }));
    }
}
