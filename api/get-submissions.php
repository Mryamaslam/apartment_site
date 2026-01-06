<?php
header('Content-Type: application/json');
// Note: For better security, add PHP session check here later
// For now, this allows access - you can protect it with .htaccess or move to PHP dashboard

// File to read submissions from
$dataFile = __DIR__ . '/../data/submissions.json';

// Read submissions
$submissions = [];
if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    $submissions = json_decode($content, true) ?: [];
}

// Sort by timestamp (newest first)
usort($submissions, function($a, $b) {
    return strtotime($b['timestamp']) - strtotime($a['timestamp']);
});

echo json_encode($submissions);
?>

