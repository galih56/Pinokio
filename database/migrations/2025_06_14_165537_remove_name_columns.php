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
        Schema::table('form_fields', function (Blueprint $table) {
            $table->dropColumn('name');
        });
        
        Schema::table('form_sections', function (Blueprint $table) {
            $table->string('label');
            $table->dropColumn('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_fields', function (Blueprint $table) {
            $table->string('name');
        });
        
        Schema::table('form_sections', function (Blueprint $table) {
            $table->dropColumn('label');
            $table->string('name');
        });
    }
};
