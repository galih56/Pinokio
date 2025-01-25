<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Issue;
use App\Models\Task;
use App\Models\Tag;

class IssueTagTest extends TestCase
{
    use RefreshDatabase;

    public function test_issues_can_have_tags()
    {

        $issue = Issue::create([
            'title' => 'Bug Report','due_date' => '2025-01-25 14:55:41']
        );
    
        $tag1 = Tag::create(['name' => 'Bug', 'color' => 'red']);
        $tag2 = Tag::create(['name' => 'Feature', 'color' => 'blue']);
    
        $issue->tags()->attach([$tag1->id, $tag2->id]);
    
        $this->assertCount(2, $issue->tags);
        $this->assertTrue($issue->tags->contains($tag1));
        $this->assertTrue($issue->tags->contains($tag2));
    }
    
}
