<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$dataFile = __DIR__ . '/../data/submissions.json';
$dataDir = dirname($dataFile);

$info = [
    'status' => 'success',
    'message' => 'API Test Endpoint',
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'data_file_path' => $dataFile,
    'data_file_exists' => file_exists($dataFile),
    'data_file_readable' => file_exists($dataFile) ? is_readable($dataFile) : false,
    'data_file_writable' => file_exists($dataFile) ? is_writable($dataFile) : false,
    'data_dir_exists' => is_dir($dataDir),
    'data_dir_writable' => is_dir($dataDir) ? is_writable($dataDir) : false,
    'data_dir_permissions' => is_dir($dataDir) ? substr(sprintf('%o', fileperms($dataDir)), -4) : 'N/A',
    'data_file_permissions' => file_exists($dataFile) ? substr(sprintf('%o', fileperms($dataFile)), -4) : 'N/A',
    'submissions_count' => 0
];

// Try to read submissions count
if (file_exists($dataFile) && is_readable($dataFile)) {
    $content = @file_get_contents($dataFile);
    if ($content !== false) {
        $submissions = @json_decode($content, true);
        if (is_array($submissions)) {
            $info['submissions_count'] = count($submissions);
        }
    }
}

// Check if we can write
if (is_dir($dataDir) && is_writable($dataDir)) {
    $testFile = $dataDir . '/.test_write';
    $testWrite = @file_put_contents($testFile, 'test');
    $info['can_write_test'] = $testWrite !== false;
    if ($testWrite !== false) {
        @unlink($testFile);
    }
} else {
    $info['can_write_test'] = false;
}

echo json_encode($info, JSON_PRETTY_PRINT);
?>

