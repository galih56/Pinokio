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
        Schema::table('forms', function (Blueprint $table) {
            $table->dropColumn('access_type');
            $table->boolean('requires_token')->default(false);
            $table->boolean('requires_identifier')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('forms', function (Blueprint $table) {
            $table->enum('access_type', ['public', 'token', 'identifier'])->default('public');
            $table->dropColumn('requires_token');
            $table->dropColumn('requires_identifier');
        });
    }
};
