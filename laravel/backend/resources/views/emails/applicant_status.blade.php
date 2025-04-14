<!DOCTYPE html>
<html>
<head>
    <title>Application Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .status {
            font-weight: bold;
            color: {{ $data['status'] === 'accepted' ? '#10b981' : '#ef4444' }};
        }
    </style>
</head>
<body>
    <h2>Application Status Update</h2>
    
    <p>Dear {{ $data['applicant']->first_name }} {{ $data['applicant']->last_name }},</p>
    
    <p>Your application for <strong>{{ $data['job']->job_title }}</strong> at 
    <strong>{{ $data['employer']->organisation_name }}</strong> has been updated.</p>
    
    <p>Status: <span class="status">{{ ucfirst($data['status']) }}</span></p>
    
    @if($data['status'] === 'accepted')
        <p>Congratulations! The employer may contact you soon for next steps.</p>
    @elseif($data['status'] === 'denied')
        <p>We appreciate your interest and encourage you to apply for other opportunities.</p>
    @endif
    
    <p>Thank you for using our platform.</p>
    
    <p>Best regards,<br>
    PAM Team</p>
</body>
</html>