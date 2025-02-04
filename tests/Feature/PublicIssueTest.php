<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Http;

class PublicIssueTest extends TestCase
{
    // Use RefreshDatabase if you want to reset the database between tests
    use RefreshDatabase;

    /**
     * Test to ensure public issues are rate-limited.
     *
     * @return void
     */
    public function test_public_issue_route_is_rate_limited()
    {
        // Simulate requests from the same IP
        $ip = '127.0.0.1';

        // Hit the route 30 times (or the limit you've set)
        for ($i = 0; $i < 30; $i++) {
            $this->get('/public-issues', ['REMOTE_ADDR' => $ip]);
        }

        // The 31st request should hit the rate limit
        $response = $this->get('/public-issues', ['REMOTE_ADDR' => $ip]);
        $response->assertStatus(429); // Expecting HTTP 429 Too Many Requests
    }

    /**
     * Test that public issue list fetch works and returns a successful response.
     *
     * @return void
     */
    public function test_public_issue_route_with_successful_request()
    {
        // Test that the endpoint works for an initial request
        $response = $this->get('/public-issues');
        $response->assertStatus(200); // Ensure the response is successful
        $response->assertJsonStructure([
            'data' // Assert that the response contains 'data'
        ]);
    }

    /**
     * Test that an IP is correctly rate-limited after multiple requests.
     *
     * @return void
     */
    public function test_ip_rate_limit()
    {
        // Mock the RateLimiter for a particular route and IP
        $ip = '127.0.0.1';
        $limiter = RateLimiter::for('public_issues', function ($request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // Simulate sending requests
        for ($i = 0; $i < 30; $i++) {
            $this->assertTrue($limiter->hit('public_issues:' . $ip));
        }

        // The 31st request should fail
        $this->assertFalse($limiter->hit('public_issues:' . $ip));
    }

    /**
     * Test that a rate-limited request returns the correct status code.
     *
     * @return void
     */
    public function test_rate_limit_status_code()
    {
        $ip = '127.0.0.1';

        // Make 30 requests
        for ($i = 0; $i < 30; $i++) {
            $this->get('/public-issues', ['REMOTE_ADDR' => $ip]);
        }

        // Make the 31st request, which should be rate-limited
        $response = $this->get('/public-issues', ['REMOTE_ADDR' => $ip]);

        // Assert that the response is 429 (Too Many Requests)
        $response->assertStatus(429);
    }

    /**
     * Test the 'public-issues/{id}' route to retrieve an individual issue.
     *
     * @return void
     */
    public function test_get_public_issue()
    {
        // Assuming you have a fixture or factory for an issue, for example:
        $issue = \App\Models\Issue::factory()->create();

        $response = $this->get('/public-issues/' . $issue->id);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'description',
                'dueDate',
                'status'
            ]
        ]);
    }

    /**
     * Test public issue creation (assuming public can create issues).
     *
     * @return void
     */
    public function test_create_public_issue()
    {
        // Sample data for creating an issue
        $data = [
            'title' => 'Test Issue',
            'description' => 'This is a test issue description',
            'status' => 'open',
            'dueDate' => now()->addDays(7)->toDateString()
        ];

        // Send a POST request to create an issue
        $response = $this->postJson('/public-issues', $data);

        $response->assertStatus(201);
        $response->assertJson([
            'data' => [
                'title' => 'Test Issue',
                'description' => 'This is a test issue description'
            ]
        ]);
    }
}
