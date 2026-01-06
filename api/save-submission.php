<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// File to store submissions
$dataFile = __DIR__ . '/../data/submissions.json';

// Create data directory if it doesn't exist
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
if (empty($data['fullName']) || empty($data['phoneNumber'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name and phone number are required']);
    exit;
}

// Prepare submission data
$submission = [
    'id' => time() . '_' . mt_rand(1000, 9999),
    'timestamp' => date('c'),
    'date' => date('M d, Y, h:i A'),
    'fullName' => htmlspecialchars($data['fullName'] ?? '', ENT_QUOTES, 'UTF-8'),
    'phoneNumber' => htmlspecialchars($data['phoneNumber'] ?? '', ENT_QUOTES, 'UTF-8'),
    'email' => htmlspecialchars($data['email'] ?? '', ENT_QUOTES, 'UTF-8'),
    'apartmentType' => htmlspecialchars($data['apartmentType'] ?? '', ENT_QUOTES, 'UTF-8'),
    'userType' => htmlspecialchars($data['userType'] ?? '', ENT_QUOTES, 'UTF-8'),
    'message' => htmlspecialchars($data['message'] ?? '', ENT_QUOTES, 'UTF-8')
];

// Read existing submissions
$submissions = [];
if (file_exists($dataFile)) {
    $existing = file_get_contents($dataFile);
    $submissions = json_decode($existing, true) ?: [];
}

// Add new submission
$submissions[] = $submission;

// Save back to file
file_put_contents($dataFile, json_encode($submissions, JSON_PRETTY_PRINT));

// Return success
echo json_encode(['success' => true, 'message' => 'Submission saved successfully', 'id' => $submission['id']]);
?>

