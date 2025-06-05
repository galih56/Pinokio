<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add form_id to form_groups
        Schema::table('form_groups', function (Blueprint $table) {
            $table->foreignId('form_id')->nullable()->after('id')->constrained('forms')->nullOnDelete();
        });

        // Add form_id to form_submissions
        Schema::table('form_submissions', function (Blueprint $table) {
            $table->foreignId('form_id')->nullable()->after('id')->constrained('forms')->nullOnDelete();
        });

        // Detect the database driver
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL syntax
            DB::statement("
                UPDATE form_groups
                SET form_id = form_templates.form_id
                FROM form_templates
                WHERE form_groups.form_template_id = form_templates.id
            ");

            DB::statement("
                UPDATE form_submissions
                SET form_id = form_templates.form_id
                FROM form_templates
                WHERE form_submissions.form_template_id = form_templates.id
            ");
        } elseif ($driver === 'mysql') {
            // MySQL syntax
            DB::statement("
                UPDATE form_groups
                JOIN form_templates ON form_groups.form_template_id = form_templates.id
                SET form_groups.form_id = form_templates.form_id
            ");

            DB::statement("
                UPDATE form_submissions
                JOIN form_templates ON form_submissions.form_template_id = form_templates.id
                SET form_submissions.form_id = form_templates.form_id
            ");
        } else {
            throw new \Exception("Unsupported DB driver: $driver");
        }

        // Drop old foreign keys and columns
        Schema::table('form_groups', function (Blueprint $table) {
            $table->dropForeign(['form_template_id']);
            $table->dropColumn('form_template_id');
        });

        Schema::table('form_submissions', function (Blueprint $table) {
            $table->dropForeign(['form_template_id']);
            $table->dropColumn('form_template_id');
        });

        // Drop the form_templates table
        Schema::dropIfExists('form_templates');
    }

    public function down()
    {
        Schema::create('form_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('form_groups', function (Blueprint $table) {
            $table->foreignId('form_template_id')->nullable()->after('id')->constrained('form_templates')->nullOnDelete();
        });

        Schema::table('form_submissions', function (Blueprint $table) {
            $table->foreignId('form_template_id')->nullable()->after('id')->constrained('form_templates')->nullOnDelete();
        });

        Schema::table('form_groups', function (Blueprint $table) {
            $table->dropForeign(['form_id']);
            $table->dropColumn('form_id');
        });

        Schema::table('form_submissions', function (Blueprint $table) {
            $table->dropForeign(['form_id']);
            $table->dropColumn('form_id');
        });
    }
};
