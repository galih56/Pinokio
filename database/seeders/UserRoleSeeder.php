<?php

namespace Database\Seeders;

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
            [ 'name' => 'Administrator' , 'code' => 'ADMIN'],
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
