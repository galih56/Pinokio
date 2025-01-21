<?php

namespace App\Http\Controllers\web;

use App\Http\Controllers\Controller;
use Auth;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExportType;

class WebController extends Controller
{
    public function __construct()
    {

    }

    public function index(){
        $user = Auth::user();
        return view('dashboard');

        /*
            if(empty($user)) return redirect()->route('auth');

            $user = $user->load('role');

            if(in_array($user->role->code, ['ADMIN'])) {
                return view('dashboard');
            }
        */
    }

    public function issueTrackerApp(){
        return view('issue-tracker');
    }

    public function authApp(){
        $user = Auth::user();
        if($user) return redirect()->route('main-app');
        return view('authentication');
    }

}
