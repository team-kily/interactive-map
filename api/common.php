<?php
declare(strict_types=1);

const DATA_FILE = __DIR__ . '/../data/stores.json';

function jsonResponse(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readStores(): array
{
    $contents = @file_get_contents(DATA_FILE);
    $stores = $contents === false ? null : json_decode($contents, true);
    return is_array($stores) ? $stores : [];
}

function writeStores(array $stores): bool
{
    $json = json_encode(array_values($stores), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return $json !== false && file_put_contents(DATA_FILE, $json . PHP_EOL, LOCK_EX) !== false;
}

function cleanString(mixed $value, int $maxLength = 160): string
{
    $value = trim((string) $value);
    return mb_substr($value, 0, $maxLength);
}

function isAdmin(): bool
{
    return isset($_SESSION['map_admin']) && $_SESSION['map_admin'] === true;
}
