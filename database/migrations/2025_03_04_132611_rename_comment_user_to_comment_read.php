<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::rename('comment_user', 'comment_reads');
    }

    public function down()
    {
        Schema::rename('comment_reads', 'comment_user');
    }
};
