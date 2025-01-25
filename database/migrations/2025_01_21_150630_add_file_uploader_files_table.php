<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('files', function (Blueprint $table) {
            $table->unsignedBigInteger('uploader_id')->nullable()->after('id');
            $table->string('uploader_type')->nullable()->after('uploader_id');
        });
    }

    
    public function down()
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn(['uploader_id', 'uploader_type']);
        });
    }
};
