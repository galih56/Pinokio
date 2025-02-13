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
        Schema::table('issues', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->enum('status', [
                'active', 
                'completed', 
                'archived',
                'idle', 
                'in progress', 
                'finished', 
                'draft', 
                'inactive',
                'done',      
                'resolved',
                'closed' 
            ])->default('idle');
        });
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->enum('status', [
                'active', 
                'completed', 
                'archived',
                'idle', 
                'in progress', 
                'finished', 
                'draft', 
                'inactive',
                'done',           
                'resolved',
                'closed'  
            ])->default('idle');
        });
        Schema::table('issues', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->enum('status', [
                'active', 
                'completed', 
                'archived',
                'idle', 
                'in progress', 
                'finished', 
                'draft', 
                'inactive',
                'done',         
                'resolved',
                'closed'   
            ])->default('idle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('issues', function (Blueprint $table) {
            //
        });
    }
};
