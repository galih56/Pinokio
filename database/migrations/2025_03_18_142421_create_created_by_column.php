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
            $table->rename('creator_id','created_by');
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
            $table->rename('created_by','creator_id');
        });
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['created_by']); 
            $table->dropColumn('created_by'); 
        });
    }
};
