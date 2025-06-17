<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Forms\FieldType;

class FieldTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'text', 'description' => 'Text Input'],
            ['name' => 'email', 'description' => 'Email'],
            ['name' => 'tel', 'description' => 'Phone Number'],
            ['name' => 'number', 'description' => 'Number'],
            ['name' => 'date', 'description' => 'Date Picker'],
            ['name' => 'url', 'description' => 'URL'],
            ['name' => 'textarea', 'description' => 'Text Area'],
            ['name' => 'select', 'description' => 'Select Dropdown'],
            ['name' => 'radio', 'description' => 'Radio Buttons'],
            ['name' => 'checkbox', 'description' => 'Checkboxes'],
        ];

        foreach ($types as $type) {
            FieldType::updateOrCreate(['name' => $type['name']], $type);
        }
    }
}
