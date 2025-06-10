<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop ALL foreign key constraints first
        Schema::table('form_entries', function (Blueprint $table) {
            $table->dropForeign(['form_field_id']);
        });

        Schema::table('form_fields', function (Blueprint $table) {
            $table->dropForeign(['form_section_id']);
        });

        Schema::table('form_field_options', function (Blueprint $table) {
            $table->dropForeign(['form_field_id']);
        });

        // Change all column types (start with parent tables first)
        // Change form_sections first (no dependencies)
        DB::statement('ALTER TABLE form_sections ALTER COLUMN id TYPE VARCHAR(191)');

        // Change form_fields (depends on form_sections)
        DB::statement('ALTER TABLE form_fields ALTER COLUMN id TYPE VARCHAR(191)');
        DB::statement('ALTER TABLE form_fields ALTER COLUMN form_section_id TYPE VARCHAR(191)');

        // Change child tables
        DB::statement('ALTER TABLE form_field_options ALTER COLUMN id TYPE VARCHAR(191)');
        DB::statement('ALTER TABLE form_field_options ALTER COLUMN form_field_id TYPE VARCHAR(191)');
        DB::statement('ALTER TABLE form_entries ALTER COLUMN form_field_id TYPE VARCHAR(191)');

        // Re-add ALL foreign key constraints
        Schema::table('form_fields', function (Blueprint $table) {
            $table->foreign('form_section_id')->references('id')->on('form_sections')->onDelete('cascade');
        });

        Schema::table('form_field_options', function (Blueprint $table) {
            $table->foreign('form_field_id')->references('id')->on('form_fields')->onDelete('cascade');
        });

        Schema::table('form_entries', function (Blueprint $table) {
            $table->foreign('form_field_id')->references('id')->on('form_fields')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop ALL foreign key constraints first
        Schema::table('form_entries', function (Blueprint $table) {
            $table->dropForeign(['form_field_id']);
        });

        Schema::table('form_fields', function (Blueprint $table) {
            $table->dropForeign(['form_section_id']);
        });

        Schema::table('form_field_options', function (Blueprint $table) {
            $table->dropForeign(['form_field_id']);
        });

        // Revert column types (start with child tables first)
        DB::statement('ALTER TABLE form_entries ALTER COLUMN form_field_id TYPE BIGINT USING form_field_id::BIGINT');
        DB::statement('ALTER TABLE form_field_options ALTER COLUMN form_field_id TYPE BIGINT USING form_field_id::BIGINT');
        DB::statement('ALTER TABLE form_field_options ALTER COLUMN id TYPE BIGINT USING id::BIGINT');
        
        DB::statement('ALTER TABLE form_fields ALTER COLUMN form_section_id TYPE BIGINT USING form_section_id::BIGINT');
        DB::statement('ALTER TABLE form_fields ALTER COLUMN id TYPE BIGINT USING id::BIGINT');
        
        DB::statement('ALTER TABLE form_sections ALTER COLUMN id TYPE BIGINT USING id::BIGINT');

        // Re-add ALL foreign key constraints
        Schema::table('form_fields', function (Blueprint $table) {
            $table->foreign('form_section_id')->references('id')->on('form_sections')->onDelete('cascade');
        });

        Schema::table('form_field_options', function (Blueprint $table) {
            $table->foreign('form_field_id')->references('id')->on('form_fields')->onDelete('cascade');
        });

        Schema::table('form_entries', function (Blueprint $table) {
            $table->foreign('form_field_id')->references('id')->on('form_fields')->onDelete('cascade');
        });
    }
};
