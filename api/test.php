<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'success',
    'message' => 'API is working',
    'data_file' => __DIR__ . '/../data/submissions.json',
    'data_file_exists' => file_exists(__DIR__ . '/../data/submissions.json'),
    'data_dir_writable' => is_writable(__DIR__ . '/../data')
]);
?>

