<?php
$req_url = 'https://v6.exchangerate-api.com/v6/f8a923e10ede2bd3b17f3497/latest/USD';
$response_json = file_get_contents($req_url);
if($response_json){
    $currencyCode = $_REQUEST['currencyCode'];
    $response = json_decode($response_json);
    $base_price = 1;
    $conversion = round(($base_price * $response->conversion_rates->$currencyCode),2);
    $output['error'] = false;
    $output['data'] = $conversion;
    echo json_encode($output);
}else{
    $output['error'] = true;
    $output['error-message'] = 'Couldnt Fetch Currencies Conversion';
    $output['data'] = null;
    echo json_encode($output);
}

?>
