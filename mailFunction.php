<?php
function sendEmail($to, $subject, $message, $from = 'sunamong@themiracle.love') {
    $headers = "From: $from" . "\r\n" .
               "Reply-To: $from" . "\r\n" .
               "X-Mailer: PHP/" . phpversion();
    
    return mail($to, $subject, $message, $headers);
}
?>
