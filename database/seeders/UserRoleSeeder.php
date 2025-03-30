<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userRoles = [
            [
                'id' => 1,
                'code' => 'ADMIN',
                'name' => 'Administrator',
                'description' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 2,
                'code' => 'MEMBER',
                'name' => 'Member',
                'description' => null,
                'created_at' =>  Carbon::now(),
                'updated_at' =>  Carbon::now(),
            ],
        ];
        
        
        
        for ($i=0; $i < count($userRoles); $i++) { 
            $userRole = $userRoles[$i];
            $userRoleExists = \DB::table('user_roles')->where('code',$userRole['name'])->first();
            
            if (!$userRoleExists) {
                \DB::table('user_roles')->insert($userRole);
            }
        }
    }
}
