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
            $table->integer('time_limit')->default(0)->nullable()->change();
        });

        Schema::table('form_sections', function (Blueprint $table) {
            $table->text('label')->change();
        });

        Schema::table('form_fields', function (Blueprint $table) {
            $table->text('label')->change();
            $table->double('min')->nullable();
            $table->double('max')->nullable();
            $table->text('default_value')->nullable();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('forms', function (Blueprint $table) {
            $table->integer('time_limit')->default(0)->change();
        });

        Schema::table('form_sections', function (Blueprint $table) {
            $table->string('label')->change();
        });

        Schema::table('form_fields', function (Blueprint $table) {
            $table->string('label')->change();
            $table->dropColumn(['min']);
            $table->dropColumn(['max']);
            $table->dropColumn(['default_value']);
        });
    }
};
