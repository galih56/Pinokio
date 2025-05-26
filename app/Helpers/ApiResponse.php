<?php

namespace App\Helpers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class ApiResponse
{
    public static function rollback($e, $message ="Something went wrong! Process not completed" , $status_code = null){
        DB::rollBack();
        self::throw($e, $message);
    }

    public static function throw($e, $message ="Something went wrong! Process not completed"){
        if(env('APP_DEBUG') == true) dd($e, $message);
        else Log::info($e);
        
        throw new HttpResponseException(response()->json([
            'status' => 'error',
            "message"=> $message
        ], 500));
    }

    public static function sendResponse($result , $message='' ,$status = 'success', $code=200){
        $response=[
            'status' => $status,
        ];
            
        if ($status === 'error' && !empty($result)) {
            $response['errors'] = $result;
        } elseif (!empty($result)) {
            $response['data'] = $result;
        }

        if(!empty($message)){
            $response['message'] =$message;
        }
        return response()->json($response, $code);
    }

}
