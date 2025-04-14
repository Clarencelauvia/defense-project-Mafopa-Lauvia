<!DOCTYPE html>
<html>
<head>
    <title>New Job Posted</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #007BFF;
        }
        p {
            line-height: 1.6;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>New Job Posted</h1>
        <p>Hello,</p>
        <p>A new job titled <strong>"{{ $job->job_title }}"</strong> has been posted. Here are the details:</p>
        <ul>
    <p><strong>Organisation Name:</strong> {{ $job->organisation_name }}</p>
    <p><strong>Location:</strong> {{ $job->location }}</p>
    <p><strong>Description:</strong> {{ $job->job_description }}</p>
    <p><strong>Salary Range:</strong> {{ $job->salary_range }}</p>
    <p><strong>Job Type:</strong> {{ $job->job_type }}</p>
    <p><strong>Experience Level:</strong> {{ $job->experience_level }}</p>
    <p><strong>Company:</strong> {{ $job->company_description }}</p>
        </ul>
        <p>Thank you for using our platform!</p>
        <div class="footer">
            <p>Best regards,</p>
            <p>If you'd like to stop receiving these notifications, please update your notification settings in your account.</p>
            <p><strong>PAM Team</strong></p>
        </div>
    </div>
</body>
</html>