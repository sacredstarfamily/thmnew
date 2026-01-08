<?php
$to = "seeloveinfinite@gmail.com";
$subject = "Test Email";
$message = "This is a test email sent from info@themiracle.love.";
$headers = "From: info@themiracle.love" . "\r\n" .
           "Reply-To: info@themiracle.love" . "\r\n" .
           "X-Mailer: PHP/" . phpversion();

if (mail($to, $subject, $message, $headers)) {
    echo "Email sent successfully.";
} else {
    echo "Failed to send email.";
}
?>
