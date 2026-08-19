<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/common.php';

if (!isAdmin()) {
    jsonResponse(['error' => 'Nicht autorisiert.'], 401);
}

$query = cleanString($_GET['q'] ?? '', 240);
if (mb_strlen($query) < 4) {
    jsonResponse([]);
}

$url = 'https://nominatim.openstreetmap.org/search?' . http_build_query([
    'q' => $query,
    'format' => 'jsonv2',
    'addressdetails' => 1,
    'countrycodes' => 'de',
    'limit' => 5,
]);
$context = stream_context_create(['http' => [
    'header' => "User-Agent: Interactive-Map/1.0 (" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ")\r\n",
    'timeout' => 8,
]]);
$result = @file_get_contents($url, false, $context);
if ($result === false) {
    jsonResponse(['error' => 'Die Adresssuche ist gerade nicht erreichbar.'], 502);
}
jsonResponse(json_decode($result, true) ?: []);
