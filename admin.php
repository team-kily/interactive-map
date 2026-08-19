<?php
declare(strict_types=1);
session_start();
require __DIR__ . '/api/common.php';

$error = '';
if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}
if (isset($_POST['password'])) {
    $configuredPassword = getenv('MAP_ADMIN_PASSWORD') ?: 'bitte-aendern';
    if (hash_equals($configuredPassword, (string) $_POST['password'])) {
        $_SESSION['map_admin'] = true;
        header('Location: admin.php');
        exit;
    }
    $error = 'Das Passwort ist nicht korrekt.';
}
?>
<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marktverwaltung</title><link rel="stylesheet" href="assets/admin.css"></head>
<body>
<?php if (!isAdmin()): ?>
  <main class="login"><p class="kicker">Interner Bereich</p><h1>Marktverwaltung</h1><p>Bitte mit dem Admin-Passwort anmelden.</p>
    <?php if ($error): ?><p class="notice error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
    <form method="post"><label>Passwort<input type="password" name="password" required autofocus></label><button type="submit">Anmelden</button></form>
    <a href="./">← Zur Karte</a>
  </main>
<?php else: ?>
  <header><div><p class="kicker">Interactive Map</p><h1>Marktverwaltung</h1></div><form method="post"><button class="secondary" name="logout">Abmelden</button></form></header>
  <main class="admin-grid">
    <section class="panel"><h2>Markt hinzufügen</h2><p class="hint">Zuerst nach der vollständigen Adresse suchen, einen Treffer wählen und anschließend die Angaben ergänzen.</p>
      <div class="address-search"><label>Adresse suchen<input id="address-query" placeholder="Straße, PLZ und Stadt"></label><button id="search-address" type="button">Suchen</button></div>
      <div id="search-results" class="search-results"></div>
      <form id="store-form">
        <label>Name des Markts<input name="name" required></label>
        <div class="row"><label>Straße<input name="street"></label><label>PLZ<input name="postalCode"></label></div>
        <label>Stadt<input name="city" required></label>
        <div class="row"><label>Breitengrad<input name="lat" type="number" step="any" required></label><label>Längengrad<input name="lng" type="number" step="any" required></label></div>
        <label>Öffnungszeiten<input name="hours" placeholder="Mo–Sa 08:00–20:00"></label>
        <button type="submit">Markt speichern</button><p id="form-notice" class="notice" hidden></p>
      </form>
    </section>
    <section class="panel"><div class="panel-head"><h2>Vorhandene Märkte</h2><span id="admin-count"></span></div><div id="admin-list"></div></section>
  </main><script src="assets/admin.js"></script>
<?php endif; ?>
</body></html>
