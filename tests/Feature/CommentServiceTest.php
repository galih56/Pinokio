<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\Comment;
use App\Models\User;
use App\Services\CommentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

class CommentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $commentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->commentService = new CommentService();
    }

    /** @test */
    public function it_can_create_a_comment_for_authenticated_user()
    {
        // Create a user
        $user = User::factory()->create();

        // Authenticate the user
        $this->actingAs($user);

        // Data for the comment
        $data = [
            'comment' => 'This is a test comment',
            'commentable_id' => 1,
            'commentable_type' => 'issue',
        ];

        // Create the comment
        $comment = $this->commentService->createIssue($data);

        // Assertions
        $this->assertInstanceOf(Comment::class, $comment);
        $this->assertEquals('This is a test comment', $comment->comment);
        $this->assertEquals($user->id, $comment->commenter_id);
        $this->assertEquals(User::class, $comment->commenter_type);
    }

    /** @test */
    public function it_can_create_a_comment_for_guest_issuer()
    {
        // Data for the comment
        $data = [
            'comment' => 'This is a test comment',
            'commentable_id' => 1,
            'commentable_type' => 'issue',
            'email' => 'guest@example.com',
            'name' => 'Guest User',
            'ip_address' => '127.0.0.1',
        ];

        // Create the comment
        $comment = $this->commentService->createIssue($data);

        // Assertions
        $this->assertInstanceOf(Comment::class, $comment);
        $this->assertEquals('This is a test comment', $comment->comment);
        $this->assertNotNull($comment->commenter_id);
        $this->assertEquals(GuestIssuer::class, $comment->commenter_type);
    }

    /** @test */
    public function it_can_get_unread_comments_for_a_user()
    {
        // Create a user
        $user = User::factory()->create();

        // Create some comments
        $comment1 = Comment::factory()->create();
        $comment2 = Comment::factory()->create();

        // Mark one comment as read by the user
        $comment1->readers()->attach($user->id, ['read_at' => now()]);

        // Get unread comments
        $unreadComments = $this->commentService->getUnreadComments($user);

        // Assertions
        $this->assertCount(1, $unreadComments);
        $this->assertEquals($comment2->id, $unreadComments->first()->id);
    }

    /** @test */
    public function it_can_mark_a_comment_as_read_by_a_user()
    {
        // Create a user and a comment
        $user = User::factory()->create();
        $comment = Comment::factory()->create();

        // Mark the comment as read
        $this->commentService->markAsRead($comment, $user);

        // Assertions
        $this->assertTrue($comment->readers->contains($user->id));
        $this->assertNotNull($comment->readers->first()->pivot->read_at);
    }

    /** @test */
    public function it_can_check_if_a_comment_has_been_read_by_a_user()
    {
        // Create a user and a comment
        $user = User::factory()->create();
        $comment = Comment::factory()->create();

        // Initially, the comment should not be read
        $this->assertFalse($this->commentService->isRead($comment, $user));

        // Mark the comment as read
        $this->commentService->markAsRead($comment, $user);

        // Now, the comment should be read
        $this->assertTrue($this->commentService->isRead($comment, $user));
    }

    /** @test */
    public function it_logs_an_error_if_comment_creation_fails()
    {
        // Mock the Log facade
        Log::shouldReceive('error')->once();

        // Invalid data to force an exception
        $data = [
            'comment' => null, // This will cause a database error
            'commentable_id' => 1,
            'commentable_type' => 'issue',
        ];

        // Expect an exception
        $this->expectException(\Exception::class);

        // Attempt to create the comment
        $this->commentService->createIssue($data);
    }
}