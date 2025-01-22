<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Create projects table
        Schema::create('projects', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->text('description');
            $table->enum('status', ['active', 'completed', 'archived'])->default('active');
            $table->timestamps(0); // Using 0 for current_timestamp
        });

        // Create guest_issuers table
        Schema::create('guest_issuers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('email');
            $table->string('ip_address')->nullable();
            $table->timestamps(0); 
        });

        // Create issues table
        Schema::create('issues', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->foreignId('reporter_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('guest_issuer_id')->nullable()->constrained('guest_issuers')->onDelete('set null');
            $table->foreignId('assignee_id')->nullable();
            $table->string('assignee_type')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->date('due_date');
            $table->timestamps(0); // Using 0 for current_timestamp
        });

        // Create comments table
        Schema::create('comments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('issue_id')->constrained('issues')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('comment');
            $table->timestamps(0); // Using 0 for current_timestamp
        });

        // Create tags table
        Schema::create('tags', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name')->unique();
            $table->timestamps(0); // Using 0 for current_timestamp
        });

        // Create issue_tags table
        Schema::create('issue_tag', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('issue_id')->constrained('issues')->onDelete('cascade');
            $table->foreignId('tag_id')->constrained('tags')->onDelete('cascade');
        });

        // Create issue_history table
        Schema::create('issue_history', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('issue_id')->constrained('issues')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('action', ['created', 'updated', 'status_change', 'comment_added']);
            $table->text('action_details');
            $table->timestamps(0); // Using 0 for current_timestamp
        });
    }

    public function down()
    {
        Schema::dropIfExists('issue_history');
        Schema::dropIfExists('issue_tags');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('issues');
        Schema::dropIfExists('guest_issuers');
        Schema::dropIfExists('projects');
    }
};
