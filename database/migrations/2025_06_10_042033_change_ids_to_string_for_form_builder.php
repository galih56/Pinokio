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

        // Get database driver
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            // MySQL syntax
            DB::statement('ALTER TABLE form_sections MODIFY COLUMN id VARCHAR(191)');
            DB::statement('ALTER TABLE form_fields MODIFY COLUMN id VARCHAR(191)');
            DB::statement('ALTER TABLE form_fields MODIFY COLUMN form_section_id VARCHAR(191)');
            DB::statement('ALTER TABLE form_field_options MODIFY COLUMN id VARCHAR(191)');
            DB::statement('ALTER TABLE form_field_options MODIFY COLUMN form_field_id VARCHAR(191)');
            DB::statement('ALTER TABLE form_entries MODIFY COLUMN form_field_id VARCHAR(191)');
        } elseif ($driver === 'pgsql') {
            // PostgreSQL syntax
            DB::statement('ALTER TABLE form_sections ALTER COLUMN id TYPE VARCHAR(191)');
            DB::statement('ALTER TABLE form_fields ALTER COLUMN id TYPE VARCHAR(191)');
            DB::statement('ALTER TABLE form_fields ALTER COLUMN form_section_id TYPE VARCHAR(191)');
            DB::statement('ALTER TABLE form_field_options ALTER COLUMN id TYPE VARCHAR(191)');
            DB::statement('ALTER TABLE form_field_options ALTER COLUMN form_field_id TYPE VARCHAR(191)');
            DB::statement('ALTER TABLE form_entries ALTER COLUMN form_field_id TYPE VARCHAR(191)');
        } else {
            throw new Exception("Unsupported database driver: {$driver}");
        }

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

        // Get database driver
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            // MySQL syntax - revert to BIGINT
            DB::statement('ALTER TABLE form_entries MODIFY COLUMN form_field_id BIGINT UNSIGNED');
            DB::statement('ALTER TABLE form_field_options MODIFY COLUMN form_field_id BIGINT UNSIGNED');
            DB::statement('ALTER TABLE form_field_options MODIFY COLUMN id BIGINT UNSIGNED AUTO_INCREMENT');
            DB::statement('ALTER TABLE form_fields MODIFY COLUMN form_section_id BIGINT UNSIGNED');
            DB::statement('ALTER TABLE form_fields MODIFY COLUMN id BIGINT UNSIGNED AUTO_INCREMENT');
            DB::statement('ALTER TABLE form_sections MODIFY COLUMN id BIGINT UNSIGNED AUTO_INCREMENT');
        } elseif ($driver === 'pgsql') {
            // PostgreSQL syntax - revert to BIGINT
            DB::statement('ALTER TABLE form_entries ALTER COLUMN form_field_id TYPE BIGINT USING form_field_id::BIGINT');
            DB::statement('ALTER TABLE form_field_options ALTER COLUMN form_field_id TYPE BIGINT USING form_field_id::BIGINT');
            DB::statement('ALTER TABLE form_field_options ALTER COLUMN id TYPE BIGINT USING id::BIGINT');
            DB::statement('ALTER TABLE form_fields ALTER COLUMN form_section_id TYPE BIGINT USING form_section_id::BIGINT');
            DB::statement('ALTER TABLE form_fields ALTER COLUMN id TYPE BIGINT USING id::BIGINT');
            DB::statement('ALTER TABLE form_sections ALTER COLUMN id TYPE BIGINT USING id::BIGINT');
        } else {
            throw new Exception("Unsupported database driver: {$driver}");
        }

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