<?php
$url='https://api.openweathermap.org/data/2.5/onecall?lat='.$_REQUEST['lat'].'&lon='.$_REQUEST['lng'].'&appid=4ef2716ffdcebe56f05f86c5c6adb952&units=metric';
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
curl_setopt($ch, CURLOPT_URL, $url);

try {
    $result = curl_exec($ch);
    if ($result === false) {
        if(curl_errno($ch) == CURLE_COULDNT_CONNECT || curl_errno($ch) == CURLE_OPERATION_TIMEOUTED) {
            throw new Exception("Couldn't connect to server");
        } else {
            // throw new Exception(curl_error($ch), curl_errno($ch));
            throw new Exception("An error occurred during the Airports request. Please try again later.");
        }
    }

    $decode = json_decode($result, true);
    if ($decode === null) {
        throw new Exception('Couldnt Fetch Current Weather');
    }

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['data'] = $decode;
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
} catch (Exception $e) {
    $output['status']['code'] = $e->getCode();
    $output['status']['name'] = "error";
    $output['status']['description'] = $e->getMessage();
    $output['data'] = null;
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
}

curl_close($ch);
?>