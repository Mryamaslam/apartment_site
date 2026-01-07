<?php
// Error reporting (disable display in production, enable logging)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// File to store submissions
$dataFile = __DIR__ . '/../data/submissions.json';

// Create data directory if it doesn't exist
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    if (!@mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create data directory. Please check file permissions.']);
        exit;
    }
}

// Check if data directory is writable
if (!is_writable($dataDir)) {
    // Try to make it writable
    @chmod($dataDir, 0755);
    if (!is_writable($dataDir)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Data directory is not writable. Please set permissions to 755 or 777.']);
        exit;
    }
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

// Check for duplicate submission (same phone + name + timestamp within 5 minutes)
$isDuplicate = false;
$fiveMinutesAgo = time() - 300;
foreach ($submissions as $existing) {
    if (isset($existing['phoneNumber']) && isset($existing['fullName']) && isset($existing['timestamp'])) {
        if ($existing['phoneNumber'] === $submission['phoneNumber'] && 
            $existing['fullName'] === $submission['fullName']) {
            $existingTime = strtotime($existing['timestamp']);
            if ($existingTime && abs($existingTime - strtotime($submission['timestamp'])) < 300) {
                $isDuplicate = true;
                break;
            }
        }
    }
}

// Only add if not a duplicate
if (!$isDuplicate) {
    $submissions[] = $submission;
} else {
    // Return success even for duplicates to avoid errors
    echo json_encode(['success' => true, 'message' => 'Submission already exists', 'id' => $submission['id'], 'duplicate' => true]);
    exit;
}

// Save back to file
$jsonData = json_encode($submissions, JSON_PRETTY_PRINT);
if ($jsonData === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to encode data: ' . json_last_error_msg()]);
    exit;
}

$result = @file_put_contents($dataFile, $jsonData, LOCK_EX);
if ($result === false) {
    // Try to set permissions and retry
    @chmod($dataFile, 0644);
    $result = @file_put_contents($dataFile, $jsonData, LOCK_EX);
    
    if ($result === false) {
        http_response_code(500);
        $error = error_get_last();
        echo json_encode([
            'success' => false, 
            'message' => 'Failed to save submission. Please check file permissions on data/submissions.json (should be 644 or 666).',
            'error' => $error ? $error['message'] : 'Unknown error'
        ]);
        exit;
    }
}

// Return success
echo json_encode(['success' => true, 'message' => 'Submission saved successfully', 'id' => $submission['id']]);
?>

