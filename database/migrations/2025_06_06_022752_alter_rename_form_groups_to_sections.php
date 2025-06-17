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
            $table->dropForeign(['form_group_id']);
        });

        Schema::rename('form_groups', 'form_sections');

        Schema::table('form_fields', function (Blueprint $table) {
            $table->renameColumn('form_group_id', 'form_section_id');
        });

        Schema::table('form_fields', function (Blueprint $table) {
            $table->foreign('form_section_id')->references('id')->on('form_sections')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_fields', function (Blueprint $table) {
            $table->dropForeign(['form_section_id']);
        });

        Schema::rename('form_sections', 'form_groups');

        Schema::table('form_fields', function (Blueprint $table) {
            $table->renameColumn('form_section_id', 'form_group_id');
        });

        Schema::table('form_fields', function (Blueprint $table) {
            $table->foreign('form_group_id')->references('id')->on('form_groups')->onDelete('cascade');
        });
    }
};
