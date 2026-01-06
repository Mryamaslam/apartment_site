<?php
header('Content-Type: application/json');
// Note: For better security, add PHP session check here later

// Get submission ID from POST
$input = file_get_contents('php://input');
$data = json_decode($input, true);
$submissionId = $data['id'] ?? null;

if (!$submissionId) {
    http_response_code(400);
    echo json_encode(['error' => 'Submission ID required']);
    exit;
}

// File to read/write submissions
$dataFile = __DIR__ . '/../data/submissions.json';

// Read submissions
$submissions = [];
if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    $submissions = json_decode($content, true) ?: [];
}

// Remove submission with matching ID
$submissions = array_filter($submissions, function($sub) use ($submissionId) {
    return $sub['id'] !== $submissionId;
});

// Re-index array
$submissions = array_values($submissions);

// Save back to file
file_put_contents($dataFile, json_encode($submissions, JSON_PRETTY_PRINT));

echo json_encode(['success' => true, 'message' => 'Submission deleted']);
?>

