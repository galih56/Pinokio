<?php

namespace App\Exceptions;

use Exception;

class RecordExistsException extends Exception
{
    protected $message = 'Record already exists.';
    protected $code = 409; // HTTP Status Code for Conflict

    /**
     * Constructor
     */
    public function __construct($message = null)
    {
        if ($message)  $this->message = $message;
    }

    /**
     * Get the exception's HTTP status code.
     */
    public function getStatusCode()
    {
        return $this->code;
    }
}
