<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('comment_reads', function (Blueprint $table) {
            $table->dropColumn('user_id');

            $table->unsignedBigInteger('reader_id');
            $table->string('reader_type'); // 'user/guest_issuer'

            // Add indexes for better performance
            $table->index(['reader_id', 'reader_type']);
        });
    }

    public function down()
    {
        Schema::table('comment_reads', function (Blueprint $table) {
            // Drop new polymorphic columns
            $table->dropColumn(['reader_id', 'reader_type']);

            // Re-add user_id column
            $table->unsignedBigInteger('user_id')->index();
        });
    }
};
