<?php 
namespace App\Exceptions;

use Exception;

class InvalidIdException extends Exception
{
    public function render($request)
    {
        return response()->json([
            'message' => 'Request is unrecognized',
        ], 400);
    }
}
