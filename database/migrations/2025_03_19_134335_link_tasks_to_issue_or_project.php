<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('issue_id')->after('due_date')->nullable(); 
            $table->foreign('issue_id')->references('id')->on('issues')->onDelete('cascade');

            // make tasks dependable on another task
            $table->unsignedBigInteger('task_id')->after('due_date')->nullable(); 
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign('tasks_issue_id_foreign');
            $table->dropForeign('tasks_task_id_foreign');
            $table->dropColumn('issue_id'); 
            $table->dropColumn('task_id'); 
        });
    }
};
