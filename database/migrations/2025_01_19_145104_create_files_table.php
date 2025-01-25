<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Create the 'files' table
        Schema::create('files', function (Blueprint $table) {
            $table->id(); 
            $table->string('name'); 
            $table->text('path'); 
            $table->string('mime_type'); // MIME type (e.g., application/pdf)
            $table->unsignedBigInteger('size'); // File size in bytes
            $table->timestamp('uploaded_at')->default(DB::raw('CURRENT_TIMESTAMP')); // Upload timestamp
        });

        // Create the 'file_associations' table
        Schema::create('file_associations', function (Blueprint $table) {
            $table->id(); 
            $table->unsignedBigInteger('file_id'); 
            $table->unsignedBigInteger('related_id'); 
            $table->string('related_type');

            $table->foreign('file_id')->references('id')->on('files')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('file_associations');
        Schema::dropIfExists('files');
    }
};
