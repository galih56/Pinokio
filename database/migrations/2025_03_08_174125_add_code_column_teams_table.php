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
            $table->string('color', 50)->nullable()->after('name');
            $table->string('description')->nullable()->after('name');
            $table->unsignedBigInteger('creator_id')->after('description');
            $table->foreign('creator_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('color');
            $table->dropColumn('description');
            
            $table->dropForeign(['creator_id']); 
            $table->dropColumn('creator_id');  
        });
    }
};
