<?php
namespace App\Helpers;
use Carbon\Carbon;

class DatetimeHelper {
    public static function createDateTimeObject($datetimeString, $formats = [
        'Y-m-d\TH:i:s.v\Z',
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
    ], $defaultFormat = 'Y-m-d\TH:i:s.v\Z') {
        try {
            $dateTime = Carbon::createFromFormat($defaultFormat, $datetimeString);
            if ($dateTime) {
                return $dateTime;
            }
        } catch (\Exception $e) {
            // If parsing ISO 8601 fails, continue with other formats
            foreach ($formats as $format) {
                try {
                    $dateTime = Carbon::createFromFormat($format, $datetimeString);

                    if ($dateTime !== false) {
                        // Ensure no parse errors occurred
                        if ($dateTime->format($format) === $datetimeString) {
                            return $dateTime;
                        }
                    }
                } catch (\Exception $e) {
                    // Skip invalid formats
                    continue;
                }
            }
        }


        return false; // Return false if no format matches
    }

}