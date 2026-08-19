<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Supermärkte in deiner Nähe auf einer interaktiven Karte.">
  <title>Interactive Map</title>
  <link rel="preconnect" href="https://unpkg.com">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIINfQ3ynhMZjoAqOS1lInrY9ItvL2Y4W6I=" crossorigin="">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="./" aria-label="Interactive Map Startseite">
      <span class="brand-mark">I</span><span>Interactive Map</span>
    </a>
    <span class="eyebrow">Gute Märkte. Schnell gefunden.</span>
  </header>

  <main>
    <section class="intro">
      <div>
        <p class="kicker">Marktfinder</p>
        <h1>Finde deinen Markt.</h1>
        <p>Entdecke ausgewählte Supermärkte, Adressen und Öffnungszeiten auf einen Blick.</p>
      </div>
      <div class="search-wrap">
        <label for="city-search">Stadt oder Markt suchen</label>
        <input id="city-search" type="search" placeholder="z. B. Bremen" autocomplete="off">
      </div>
    </section>

    <nav class="city-chips" aria-label="Ausgewählte Städte">
      <button class="chip active" type="button" data-city="">Alle Märkte</button>
      <div id="city-buttons"></div>
    </nav>

    <section class="finder" aria-label="Marktfinder">
      <div id="map" aria-label="Interaktive Karte mit Standorten"></div>
      <aside class="results">
        <div class="results-head">
          <div><span id="result-count">0</span> Märkte</div>
          <button id="reset-map" type="button">Karte zurücksetzen</button>
        </div>
        <div id="store-list" class="store-list" aria-live="polite"></div>
        <p id="empty-state" class="empty" hidden>Keine Märkte für diese Suche gefunden.</p>
      </aside>
    </section>
  </main>

  <footer>
    <span>Interactive Map</span>
    <span>Kartendaten © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap-Mitwirkende</a></span>
  </footer>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="assets/app.js"></script>
</body>
</html>
