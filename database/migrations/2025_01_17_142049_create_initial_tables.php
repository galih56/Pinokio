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
            $table->timestamps(0); 
        });

        // Create guest_issuers table
        Schema::create('guest_issuers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('email');
            $table->timestamps(0); 
        });

        // Create issues table
        Schema::create('issues', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->foreignId('reporter_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('guest_issuer_id')->nullable()->constrained('guest_issuers')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['idle', 'in progress', 'resolved', 'closed'])->default('idle');
            $table->enum('priority', ['undefined','unverified','low', 'medium', 'high', 'critical'])->default('unverified');
            $table->date('due_date');
            $table->timestamps(0); 
        });

        // Create comments table
        Schema::create('comments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('issue_id')->constrained('issues')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('comment');
            $table->timestamps(0); 
        });

        // Create tags table
        Schema::create('tags', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name')->unique();
            $table->timestamps(0); 
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
            $table->timestamps(0); 
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
