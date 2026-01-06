<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
// Note: For better security, add PHP session check here later
// For now, this allows access - you can protect it with .htaccess or move to PHP dashboard

// File to read submissions from
$dataFile = __DIR__ . '/../data/submissions.json';

// Read submissions
$submissions = [];
if (file_exists($dataFile)) {
    $content = @file_get_contents($dataFile);
    if ($content !== false && $content !== '') {
        $decoded = json_decode($content, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $submissions = $decoded;
        }
    }
}

// Sort by timestamp (newest first)
if (!empty($submissions)) {
    usort($submissions, function($a, $b) {
        $timeA = isset($a['timestamp']) ? strtotime($a['timestamp']) : 0;
        $timeB = isset($b['timestamp']) ? strtotime($b['timestamp']) : 0;
        return $timeB - $timeA;
    });
}

echo json_encode($submissions);
?>

