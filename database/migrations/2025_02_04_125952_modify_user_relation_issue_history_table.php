<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('issue_history', function (Blueprint $table) {
            $table->dropForeign(['user_id']); 
            $table->dropColumn('user_id');  
        
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_type')->nullable();
        });
        Schema::rename('issue_history', 'issue_logs');
    }


    public function down()
    {
        Schema::rename('issue_logs', 'issue_history');

        Schema::table('issue_history', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'user_type']); 

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
