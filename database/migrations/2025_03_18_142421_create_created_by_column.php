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
        Schema::table('teams', function (Blueprint $table) {
            $table->dropForeign(['creator_id']); 
            $table->dropColumn('creator_id'); 
            $table->unsignedBigInteger('created_by')->after('description');
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->after('description');
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropForeign(['created_by']); 
            $table->dropColumn('created_by'); 
            $table->unsignedBigInteger('creator_id')->after('description');
            $table->foreign('creator_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['created_by']); 
            $table->dropColumn('created_by'); 
        });
    }
};
