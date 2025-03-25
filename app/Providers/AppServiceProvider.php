<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

use Illuminate\Support\Facades\Validator;
use App\Helpers\DateTimeHelper;
use App\Services\HashidService;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(HashidService::class, function ($app) {
            return new HashidService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        Relation::enforceMorphMap([
            'guest_issuer' => \App\Models\GuestIssuer::class,
            'user' => \App\Models\User::class,
            'team' => \App\Models\Team::class,
            'task' => \App\Models\Task::class,
            'project' => \App\Models\Project::class,
            'issue' => \App\Models\Issue::class,
        ]);

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
