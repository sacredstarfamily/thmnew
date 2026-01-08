<?php
function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
  }
  
if( 
    isset($_SERVER['REMOTE_ADDR']) AND ( $_SERVER['REMOTE_ADDR'] !== $_SERVER['SERVER_ADDR'] )
    ){
     
     echo json_encode(array("message"=>(' Access Denied, Your IP: ' . $_SERVER['REMOTE_ADDR']  )));
    } else {
        $postdata = file_get_contents("php://input");
        $request = json_decode($postdata);
        $email = test_input($request->email);
        $userName = test_input($request->name);
        $verificationCode = test_input($request->verificationToken);
       $to = $email;
       $subject = "Thanks for Signing Up";
       $message = "
       <html>
       <head>
       <title>Thanks for Signing Up</title>
       </head>
       <body>
       <p>Hi $userName,</p>
       <p>Thank you for signing up with us.</p>
       <p>verify your email address by clicking on the link below</p>
       <a href='https://themiracle.love/verify/$verificationCode'>Verify Email</a>
       </body>
       </html>";
       $headers = "MIME-Version: 1.0" . "\r\n";
       $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
       $headers .= 'From: info@themiracle.love' . "\r\n";
       $mailSent = mail($to,$subject,$message,$headers);
       if ($mailSent) {
           echo json_encode(array("message" => ($request->email)));
       } else {
           echo json_encode(array("error" => "Failed to send email"));
       }
    }
   
?>