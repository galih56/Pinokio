<?php

namespace App\Services;

use Hashids\Hashids;

class HashIdService
{
    protected $hashids;

    /*
        I need to build this service class just because the encode returns an array. 
        So i need to do 1 extra step to get the actual id from that array
    */
    public function __construct()
    {
        $this->hashids = new Hashids(env('HASHID_SALT'), 15);
    }

    public function encode($hashid)
    {
        $encoded = $this->hashids->encode($hashid);

        return !empty($encoded) ? $encoded : null;
    }

    public function decode($hashid)
    {
        $decoded = $this->hashids->decode($hashid);

        return !empty($decoded) ? $decoded[0] : null;
    }

}
