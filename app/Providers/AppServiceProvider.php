<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

use App\Interfaces\UserRepositoryInterface;
use App\Repositories\UserRepository;

use App\Interfaces\IssueRepositoryInterface;
use App\Repositories\IssueRepository;

use App\Interfaces\TagRepositoryInterface;
use App\Repositories\TagRepository;


use Illuminate\Support\Facades\Validator;
use App\Helpers\DateTimeHelper;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class,UserRepository::class);
        $this->app->bind(IssueRepositoryInterface::class,IssueRepository::class);
        $this->app->bind(TagRepositoryInterface::class,TagRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
        });


        Validator::extend('multi_date_format', function ($attribute, $value, $parameters, $validator) {
            // Use DateTimeHelper to check the formats
            return DateTimeHelper::createDateTimeObject($value, $parameters) !== false;
        });

        Validator::replacer('multi_date_format', function ($message, $attribute, $rule, $parameters) {
            return 'The ' . $attribute . ' must match one of the following date-time formats: ' . implode(', ', $parameters) . '.';
        });
    }
}
