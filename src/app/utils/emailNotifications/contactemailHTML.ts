export const contactEmailTemplate = (type: string, name: string, phone: string, email: string, text: string, image?: string,) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Design Submission</title>
    <style>
        /* Basic styling */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .image-preview {
            display: block;
            max-width: 100%;
            height: auto;
            margin-top: 10px;
        }
        .cta {
            font-weight: bold;
            color: #007BFF;
            text-decoration: none;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Greeting -->
        <p>Hello Admin,</p>

        <!-- Context -->
        <p>We have received a new ${type} submission from one of our users. Please find the details below:</p>

        <!-- Details -->
        <div class="header">Submission Details</div>
        <ul>
            <li><strong>User Name:</strong> ${name}</li>
            <li><strong>Contact:</strong>${phone}</li>
            <li><strong>Purpose:</strong> The user has submitted a  ${type} .</li>
        </ul>
         <p>${text}</p>



        <!-- Attachment/Preview -->

        ${image && image.length > 4 && `<div class="header">Attachment Preview</div>
        <p>The user also has uploaded a photo as part of their submission. You can view it below:</p>
        <img src="${image}" alt="Design Preview" class="image-preview">`
    }        

        <!-- Call to Action -->
        <p>Please review the submission and take appropriate action. If you need further information, feel free to reach out to the user directly.</p>
        <p>You can contact the user via email at <a href="mailto:${email}">${email}</a>.</p>

        <!-- Closing -->
        <p>Thank you for your attention.</p>
        <p>Best regards,</p>
        <p>Deep blue Team</p>

        <!-- Footer -->
        <div class="footer">
            <p>If you have any questions or need assistance, please reply to this email.</p>
        </div>
    </div>
</body>
</html>`;