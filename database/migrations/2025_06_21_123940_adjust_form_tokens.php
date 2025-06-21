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
        Schema::table('form_tokens', function (Blueprint $table) {
            // Remove columns no longer needed, it can be fetched from form_attempts
            $table->dropColumn(['open_time', 'submitted_time']);
            $table->dropColumn('updated_at');
            $table->index('token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_tokens', function (Blueprint $table) {
            $table->timestamp('open_time')->nullable();
            $table->timestamp('submitted_time')->nullable();
            $table->dropIndex(['token']);
        });
    }
};
