<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\HashidService;

class DecodeHashParameter
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $param = 'id')
    {
        if ($request->route($param)) {
            // Decrypt the parameter value and set it back into the route
            $decryptedValue = (new HashidService())->decode($request->route($param));
            $request->route()->setParameter($param, $decryptedValue);
            if($decryptedValue == null) {
                throw new \UnexpectedValueException('Request is unrecognized.');
            } 
        }

        return $next($request);
    }
}
