<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\web\WebController;

Route::get('/auth/{any?}', [WebController::class, 'authApp'])->where('any', '.*')->name('auth');
Route::get('/form-guard/{any?}', [WebController::class, 'formsApp'])->where('any', '.*')->name('form-guard');
Route::get('/request-tracker/{any?}', [WebController::class, 'issueTrackerApp'])->where('any', '.*')->name('issue-tracker');
Route::get('/{any?}', [WebController::class, 'index'])->where('any', '.*')->name('main-app');

