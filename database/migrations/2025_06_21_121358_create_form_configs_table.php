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
        Schema::create('form_behavior_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained()->onDelete('cascade');
            $table->integer('time_limit')->nullable();
            $table->boolean('allow_multiple_attempts')->default(false);
            $table->boolean('requires_token')->default(false);
            $table->boolean('requires_identifier')->default(false);
            $table->timestamps();
        });

        Schema::create('form_proctoring_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained()->onDelete('cascade');
            $table->boolean('is_enabled')->default(false);
            $table->boolean('fullscreen_required')->default(false);
            $table->boolean('webcam_required')->default(false);
            $table->integer('tab_limit')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_behavior_configs');
        Schema::dropIfExists('form_proctoring_configs');

    }
};
