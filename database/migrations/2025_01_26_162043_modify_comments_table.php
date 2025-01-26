<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('comments', function (Blueprint $table) {
            // Drop the existing foreign keys
            $table->dropForeign(['issue_id']);
            $table->dropForeign(['user_id']);

            // Drop the existing columns
            $table->dropColumn(['issue_id', 'user_id']);

            // Add polymorphic columns for commentable (Task, Project, Issue)
            $table->nullableMorphs('commentable'); 

            // Add polymorphic columns for commenter (User, GuestIssuer)
            $table->nullableMorphs('commenter'); 
            
        });
        
        Schema::create('comment_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('read_at')->nullable(); // Tracks when the comment was read
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('comment_user');
        Schema::table('comments', function (Blueprint $table) {
            // Drop the polymorphic columns
            $table->dropMorphs('commentable');
            $table->dropMorphs('commenter');

            // Re-add the original columns and foreign keys
            $table->foreignId('issue_id')->constrained('issues')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        });
    }
};
