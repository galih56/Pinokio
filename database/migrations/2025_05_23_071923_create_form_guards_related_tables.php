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
        Schema::create('forms', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('provider', ['Pinokio', 'Google Form'])->default('Pinokio');  // form source
            $table->string('form_code')->nullable()->comment('Google Form ID if external');
            $table->string('form_url')->nullable()->comment('Optional full Google Form URL');
            
            // Access control
            $table->enum('access_type', ['public', 'token', 'identifier'])->default('public');
            $table->string('identifier_label')->nullable();      // e.g. NIK, Email
            $table->text('identifier_description')->nullable();
            $table->string('identifier_type')->nullable();       // e.g. email, number
            
            $table->integer('time_limit')->default(0);
            $table->boolean('allow_multiple_attempts')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('proctored')->default(false);
            $table->timestamps();
        });

        Schema::create('form_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('form_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_template_id')->constrained('form_templates')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
        
        Schema::create('field_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_group_id')->constrained('form_groups')->onDelete('cascade');
            $table->foreignId('field_type_id')->constrained('field_types');
            $table->string('label');
            $table->string('name');
            $table->string('placeholder')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('form_field_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_field_id')->constrained('form_fields')->onDelete('cascade');
            $table->string('label');
            $table->string('value');
            $table->timestamps();
        });

        Schema::create('form_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->onDelete('cascade');
            $table->string('token')->unique();
            $table->string('identifier')->nullable()->comment('e.g., email or NIK');
            $table->timestamp('open_time')->nullable();
            $table->timestamp('submitted_time')->nullable();
            $table->boolean('is_used')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('form_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->onDelete('cascade');
            $table->foreignId('token_id')->nullable()->constrained('form_tokens')->onDelete('set null');
            $table->string('identifier')->nullable()->comment('NIK, email, or anonymous hash');
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->boolean('is_valid')->default(false);
            $table->integer('duration_seconds')->nullable();
            $table->timestamps();
        });

        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_template_id')->constrained('form_templates')->onDelete('cascade');
            $table->foreignId('submitted_by')->nullable()->constrained('users');
            $table->timestamp('submitted_at')->useCurrent();
        });

        Schema::create('form_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_submission_id')->constrained('form_submissions')->onDelete('cascade');
            $table->foreignId('form_field_id')->constrained('form_fields');
            $table->text('value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('form_entries');
        Schema::dropIfExists('form_submissions');
        Schema::dropIfExists('form_field_options');
        Schema::dropIfExists('form_fields');
        Schema::dropIfExists('field_types');
        Schema::dropIfExists('form_groups');
        Schema::dropIfExists('form_attempts');
        Schema::dropIfExists('form_tokens');
        Schema::dropIfExists('form_templates');
        Schema::dropIfExists('forms');

        Schema::enableForeignKeyConstraints();
    }
};
