<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE issue_logs ALTER COLUMN action_details TYPE JSON USING action_details::json');
        } elseif (DB::getDriverName() === 'mysql') {
            Schema::table('issue_logs', function (Blueprint $table) {
                $table->json('action_details')->change();
            });
        }
    }

    public function down()
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE issue_logs ALTER COLUMN action_details TYPE TEXT USING action_details::text');
        } elseif (DB::getDriverName() === 'mysql') {
            Schema::table('issue_logs', function (Blueprint $table) {
                $table->text('action_details')->change();
            });
        }
    }
};
