<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get submission ID from POST
$input = file_get_contents('php://input');
$data = json_decode($input, true);
$submissionId = $data['id'] ?? null;

if (!$submissionId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Submission ID required']);
    exit;
}

// File to read/write submissions
$dataFile = __DIR__ . '/../data/submissions.json';

// Check if file exists and is readable
if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Submissions file not found']);
    exit;
}

// Read submissions
$content = @file_get_contents($dataFile);
if ($content === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to read submissions file']);
    exit;
}

$submissions = json_decode($content, true);
if (!is_array($submissions)) {
    $submissions = [];
}

// Remove submission with matching ID
$originalCount = count($submissions);
$submissions = array_filter($submissions, function($sub) use ($submissionId) {
    return isset($sub['id']) && $sub['id'] !== $submissionId;
});

// Re-index array
$submissions = array_values($submissions);

// Check if anything was deleted
if (count($submissions) === $originalCount) {
    echo json_encode(['success' => false, 'message' => 'Submission not found']);
    exit;
}

// Save back to file
$jsonData = json_encode($submissions, JSON_PRETTY_PRINT);
$result = @file_put_contents($dataFile, $jsonData, LOCK_EX);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file. Check permissions.']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Submission deleted']);
?>

