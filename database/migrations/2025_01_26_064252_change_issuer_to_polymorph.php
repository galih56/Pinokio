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
        
        DB::statement('ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_reporter_id_foreign;');
        Schema::table('issues', function (Blueprint $table) {
            $table->dropForeign(['guest_issuer_id']);
            $table->dropColumn('guest_issuer_id');

            
            $table->renameColumn('reporter_id', 'issuer_id');
            $table->string('issuer_type')->nullable()->after('issuer_id');

            $table->unsignedBigInteger('issuer_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('issues', function (Blueprint $table) {
            // Reverse the changes if needed
            $table->foreignId('guest_issuer_id')->nullable()->constrained('guest_issuers')->onDelete('set null');
            $table->renameColumn('issuer_id', 'reporter_id');
            $table->dropColumn('issuer_type');
            $table->foreignId('reporter_id')->nullable()->constrained('users')->onDelete('set null');
        });
    }
};
