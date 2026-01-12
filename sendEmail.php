<?php
include 'mailFunction.php';

$to = "seeloveinfinite@gmail.com";
$subject = "Test Email";
$message = "This is a poop email sent from info@themiracle.love.";

if (sendEmail($to, $subject, $message)) {
    echo "Email sent successfully.";
} else {
    echo "Failed to send email.";
}
?>
