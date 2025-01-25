<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->enum('status', ['active', 'completed', 'archived','open', 'in progress', 'finished', 'draft', 'inactive'])->default('active');
            $table->text('description')->nullable()->change();
            $table->dateTime('start')->nullable();
            $table->dateTime('end')->nullable();
        });
    }

    public function down()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->enum('status', ['active', 'completed', 'archived'])->default('active');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->text('description')->nullable(false)->change();
            $table->dropColumn(['start', 'end']);
        });
    }
};
