<?php
$url = 'https://userclub.opendatasoft.com/api/records/1.0/search/?dataset=world-heritage-list&q='.$_REQUEST['countryName'].'&lang=en&sort=date_inscribed&facet=category&facet=region&facet=states';
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
            throw new Exception(curl_error($ch), curl_errno($ch));
        }
    }

    $decode = json_decode($result, true);
    if ($decode === null) {
        throw new Exception('Unable to parse JSON response');
    }

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['data']['unescoSites'] = $decode;
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