@component('mail::message')
# Your Job Posting Has Been Removed

Your job posting "{{ $jobTitle }}" for "{{ $company }}" has been removed by the administrator.

If you believe this was done in error, please contact support.

@component('mail::button', ['url' => config('app.url')])
Visit Site
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent