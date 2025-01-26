<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Comment;
use App\Models\Task;
use App\Models\Project;
use App\Models\Issue;
use App\Models\User;
use App\Models\GuestIssuer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_comment_can_belong_to_a_task()
    {
        // Create a Task
        $task = Task::factory()->create();

        // Create a Comment associated with the Task
        $comment = Comment::factory()->create([
            'commentable_id' => $task->id,
            'commentable_type' => Task::class,
        ]);

        // Assert that the comment belongs to the Task
        $this->assertInstanceOf(Task::class, $comment->commentable);
        $this->assertEquals($task->id, $comment->commentable->id);
    }

    /** @test */
    public function a_comment_can_belong_to_a_project()
    {
        // Create a Project
        $project = Project::factory()->create();

        // Create a Comment associated with the Project
        $comment = Comment::factory()->create([
            'commentable_id' => $project->id,
            'commentable_type' => Project::class,
        ]);

        // Assert that the comment belongs to the Project
        $this->assertInstanceOf(Project::class, $comment->commentable);
        $this->assertEquals($project->id, $comment->commentable->id);
    }

    /** @test */
    public function a_comment_can_belong_to_an_issue()
    {
        // Create an Issue
        $issue = Issue::factory()->create();

        // Create a Comment associated with the Issue
        $comment = Comment::factory()->create([
            'commentable_id' => $issue->id,
            'commentable_type' => Issue::class,
        ]);

        // Assert that the comment belongs to the Issue
        $this->assertInstanceOf(Issue::class, $comment->commentable);
        $this->assertEquals($issue->id, $comment->commentable->id);
    }

    /** @test */
    public function a_comment_can_be_made_by_a_user()
    {
        // Create a User
        $user = User::factory()->create();

        // Create a Comment associated with the User
        $comment = Comment::factory()->create([
            'commenter_id' => $user->id,
            'commenter_type' => User::class,
        ]);

        // Assert that the comment is made by the User
        $this->assertInstanceOf(User::class, $comment->commenter);
        $this->assertEquals($user->id, $comment->commenter->id);
    }

    /** @test */
    public function a_comment_can_be_made_by_a_guest_issuer()
    {
        // Create a GuestIssuer
        $guestIssuer = GuestIssuer::factory()->create();

        // Create a Comment associated with the GuestIssuer
        $comment = Comment::factory()->create([
            'commenter_id' => $guestIssuer->id,
            'commenter_type' => GuestIssuer::class,
        ]);

        // Assert that the comment is made by the GuestIssuer
        $this->assertInstanceOf(GuestIssuer::class, $comment->commenter);
        $this->assertEquals($guestIssuer->id, $comment->commenter->id);
    }

    /** @test */
    public function a_comment_can_be_associated_with_a_task_and_a_user()
    {
        // Create a Task and a User
        $task = Task::factory()->create();
        $user = User::factory()->create();

        // Create a Comment associated with the Task and the User
        $comment = Comment::factory()->create([
            'commentable_id' => $task->id,
            'commentable_type' => Task::class,
            'commenter_id' => $user->id,
            'commenter_type' => User::class,
        ]);

        // Assert that the comment belongs to the Task and is made by the User
        $this->assertInstanceOf(Task::class, $comment->commentable);
        $this->assertEquals($task->id, $comment->commentable->id);

        $this->assertInstanceOf(User::class, $comment->commenter);
        $this->assertEquals($user->id, $comment->commenter->id);
    }
    
    /** @test */
    public function a_comment_can_be_marked_as_read()
    {
        $comment = Comment::factory()->create();
        $user = User::factory()->create();

        $comment->readers()->attach($user, ['read_at' => now()]);

        $this->assertTrue($comment->readers->contains($user));
    }

    /** @test */
    public function a_comment_can_be_marked_as_unread()
    {
        $comment = Comment::factory()->create();
        $user = User::factory()->create();

        $comment->readers()->attach($user, ['read_at' => now()]);
        $comment->readers()->detach($user);

        $this->assertFalse($comment->readers->contains($user));
    }
}