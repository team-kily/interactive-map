<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonResponse(readStores());
}

if (!isAdmin()) {
    jsonResponse(['error' => 'Nicht autorisiert.'], 401);
}

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) {
    jsonResponse(['error' => 'Ungültige Anfrage.'], 400);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $store = [
        'id' => bin2hex(random_bytes(8)),
        'name' => cleanString($input['name'] ?? ''),
        'street' => cleanString($input['street'] ?? ''),
        'postalCode' => cleanString($input['postalCode'] ?? '', 12),
        'city' => cleanString($input['city'] ?? '', 80),
        'lat' => filter_var($input['lat'] ?? null, FILTER_VALIDATE_FLOAT),
        'lng' => filter_var($input['lng'] ?? null, FILTER_VALIDATE_FLOAT),
        'hours' => cleanString($input['hours'] ?? '', 240),
    ];

    if ($store['name'] === '' || $store['city'] === '' || $store['lat'] === false || $store['lng'] === false) {
        jsonResponse(['error' => 'Name, Stadt und gültige Koordinaten sind erforderlich.'], 422);
    }

    $stores = readStores();
    $stores[] = $store;
    if (!writeStores($stores)) {
        jsonResponse(['error' => 'Der Markt konnte nicht gespeichert werden.'], 500);
    }
    jsonResponse($store, 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = cleanString($input['id'] ?? '', 40);
    $stores = readStores();
    $remaining = array_values(array_filter($stores, fn(array $store): bool => ($store['id'] ?? '') !== $id));
    if (count($remaining) === count($stores)) {
        jsonResponse(['error' => 'Markt nicht gefunden.'], 404);
    }
    if (!writeStores($remaining)) {
        jsonResponse(['error' => 'Der Markt konnte nicht gelöscht werden.'], 500);
    }
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Methode nicht erlaubt.'], 405);
