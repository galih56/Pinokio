<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use App\Helpers\DateTimeHelper;

class MultiFormatDateTime implements Rule
{
    protected $formats;
    protected $dateTimeObject;

    public function __construct(array $formats = [])
    {
        $this->formats = $formats ?: [
            'd/m/Y',
            'd/m/Y H,i,s',
            'd.m.Y',
            'd/m/Y H:i:s',
            'd/m/Y H.i.s',
            'd-m-Y H:i:s',
            'Y-m-d H:i:s',
            'Y-m-d H.i.s',
            'm/d/Y g:i:s A P',
            'Y-m-d',
            'd-m-Y',
            'd-M-Y'
        ];
    }

    public function passes($attribute, $value)
    { 
        $this->dateTimeObject = DateTimeHelper::createDateTimeObject($value, $this->formats);
        return $this->dateTimeObject !== false;
    }

    public function getDateTimeObject()
    {
        return $this->dateTimeObject;
    }
    
    public function message()
    {
        return 'The :attribute is not a valid date-time.';
    }
}
