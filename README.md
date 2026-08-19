# Interactive Map

Kleine PHP-App mit OpenStreetMap/Leaflet, synchronisierter Standortliste, Stadtfiltern und passwortgeschützter Marktverwaltung.

## Serveranforderungen

- PHP 8.1 oder neuer mit `mbstring`
- Schreibrecht für PHP auf `data/stores.json`
- Apache mit `.htaccess` oder eine entsprechende Sperre des Ordners `data/` in nginx
- Ausgehende HTTPS-Verbindungen für die Adresssuche

## Einrichtung

1. Den Inhalt dieses Ordners in den Document Root der Subdomain kopieren.
2. Die Umgebungsvariable `MAP_ADMIN_PASSWORD` auf ein starkes Passwort setzen.
3. Sicherstellen, dass PHP `data/stores.json` schreiben darf.
4. `https://subdomain.example/admin.php` öffnen und Märkte eintragen.

Ohne gesetzte Umgebungsvariable lautet das vorläufige Passwort `bitte-aendern`. Das darf nicht im Produktivbetrieb verwendet werden.

## Lizenzen und Dienste

- Leaflet: BSD-2-Clause
- OpenStreetMap-Daten: ODbL, Quellenangabe ist in der Karte eingebaut
- Standard-Kartenkacheln: öffentliche OpenStreetMap-Kachelserver; deren Tile Usage Policy gilt
- Adresssuche: öffentliche Nominatim-Instanz; für geringe, manuelle Nutzung gedacht

Für stark steigenden Traffic sollte ein eigener oder kommerziell betriebener Kachel-/Geocoding-Dienst konfiguriert werden.
