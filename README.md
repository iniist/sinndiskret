# SinnDiskret

Website **sinndiskret.de** – statische Seiten (HTML/CSS), gehostet bei STRATO.
Änderungen im Repo werden automatisch per GitHub Actions über SFTP zu STRATO hochgeladen.

## So funktioniert es

| Branch | wird hochgeladen nach | erreichbar unter |
|---|---|---|
| `dev`  | `/sinndiskret-test/` | https://test.sinndiskret.de |
| `main` | `/sinndiskret/`      | https://sinndiskret.de |

- Hochgeladen wird **nur** der Ordner `public/`. Alles andere (README, Workflow) bleibt auf GitHub.
- Die Testseite wird automatisch für Suchmaschinen gesperrt.
- Bei jedem Upload entsteht die Datei `version.txt` mit Branch, Commit und Uhrzeit. Daran erkennst du, ob der Upload geklappt hat.

### Der normale Ablauf

1. Eine Änderung kommt als **Pull Request (PR) auf `dev`**.
2. Du mergst den PR → nach 1–2 Minuten ist die Änderung auf **test.sinndiskret.de**.
3. Passt alles: **Live stellen** (siehe unten) → Änderung ist auf **sinndiskret.de**.

`dev` ist immer der Stand der Testseite, `main` immer der Stand der echten Seite. Änderungen gehen nie direkt nach `main`, sondern immer erst über `dev`.

### Live stellen (Testseite → echte Seite)

1. Öffne https://github.com/iniist/sinndiskret/compare/main...dev
2. Oben muss stehen: **base: main ← compare: dev**. Darunter siehst du alle Änderungen seit dem letzten Livegang.
3. **Create pull request** → Titel z. B. `Live: neue Texte` → **Create pull request**.
4. Unten **Merge pull request** → **Confirm merge**.
   Wichtig: die normale Variante „Create a merge commit“ verwenden, **nicht** „Squash and merge“ oder „Rebase and merge“. Sonst laufen `dev` und `main` auseinander und der nächste Livegang zeigt Konflikte.
5. Unter **Actions** auf den grünen Haken warten, dann https://sinndiskret.de/version.txt prüfen (Branch: main, aktuelle Uhrzeit).

Zeigt GitHub bei Schritt 2 „There isn't anything to compare“, ist die echte Seite bereits auf dem Stand der Testseite.

Kleine Textänderungen kannst du auch selbst machen: Datei in GitHub öffnen → Stift-Symbol → ändern → unten „Commit changes“ → „Create a new branch … and start a pull request“ → als Ziel (`base`) `dev` wählen.

---

## Einmalige Einrichtung (nur im Browser)

> Die Bezeichnungen im STRATO-Menü ändern sich gelegentlich. Wenn ein Menüpunkt anders heißt, such nach dem fett gedruckten Begriff.

### Schritt 1: SFTP-Zugang für GitHub bei STRATO anlegen

1. Bei https://www.strato.de einloggen → Paket „STRATO Hosting Plus“.
2. Links **Datenbanken und Webspace** → **SFTP & SSH**.
3. Oben rechts stehen **Server** (z. B. `52571554.ssh.w1.strato.hosting`) und **Port** (`22`). Den Server notieren.
4. **Neu anlegen** klicken:
   - **Startverzeichnis:** `/` (damit der Zugang beide Ordner erreicht)
   - **Kommentar:** `GitHub Deploy`
   - **Passwort:** lang und zufällig, z. B. aus einem Passwort-Manager
5. Nach dem Speichern erscheint der neue Zugang in der Liste. Den **Benutzernamen** notieren (Format `stu…`).

Ein eigener Zugang nur für GitHub hat den Vorteil, dass du ihn jederzeit löschen kannst, ohne andere Zugänge zu berühren.

### Schritt 2: Ordner anlegen

1. Im STRATO-Menü links **Datenbanken und Webspace** → **Webspace** öffnen.
2. Im obersten Verzeichnis (`/`) zwei Ordner anlegen:
   - `sinndiskret`
   - `sinndiskret-test`
3. Falls `sinndiskret` schon existiert und Dateien enthält: Diese erst herunterladen (Sicherung). Der Upload macht den Ordner zu einer genauen Kopie von `public/` und **löscht dabei Dateien, die nicht im Repo sind**.

### Schritt 3: GitHub Secrets anlegen

1. Im Repo auf GitHub: **Settings** → links **Secrets and variables** → **Actions**.
2. Dreimal **New repository secret** anlegen:

| Name | Wert |
|---|---|
| `SFTP_SERVER`   | der Server aus Schritt 1, z. B. `52571554.ssh.w1.strato.hosting` |
| `SFTP_USERNAME` | der Benutzername aus Schritt 1, z. B. `stu123456789` |
| `SFTP_PASSWORD` | das Passwort aus Schritt 1 |

Die Werte sind danach nicht mehr einsehbar, nur überschreibbar. Das ist so gewollt.

### Schritt 4: Branches `main` und `dev` und Standard-Branch

1. Prüfen, ob es die Branches `main` und `dev` gibt (Repo-Startseite → Branch-Auswahl oben links).
2. **Settings** → **General** → **Default branch** auf `main` stellen.

### Schritt 5: Ersten Upload auf die Testseite auslösen

1. PR auf `dev` mergen (oder: **Actions** → **Deploy zu STRATO** → **Run workflow** → Branch `dev`).
2. Unter **Actions** erscheint ein Lauf. Grüner Haken = Upload erfolgreich, rotes X = siehe „Fehlersuche“.
3. Im STRATO-Dateimanager sollten jetzt im Ordner `sinndiskret-test` die Dateien liegen (`index.html`, `css`, …).

### Schritt 6: Subdomain test.sinndiskret.de auf den Ordner zeigen lassen

1. STRATO-Menü → **Domains** → **Domainverwaltung**.
2. Bei `sinndiskret.de` eine **Subdomain anlegen**: `test`.
3. In den Einstellungen der Subdomain (Zahnrad) als Ziel **Verzeichnis** `/sinndiskret-test` wählen.
4. Unter **SSL** prüfen, dass auch für `test.sinndiskret.de` ein Zertifikat aktiv ist. Es kann ein paar Minuten bis Stunden dauern.
5. Aufrufen: https://test.sinndiskret.de

### Schritt 7: Hauptdomain umstellen (erst wenn die Testseite passt)

1. PR von `dev` nach `main` mergen → Dateien landen in `/sinndiskret`.
2. STRATO-Menü → **Domainverwaltung** → bei `sinndiskret.de` (Zahnrad) → Ziel **Verzeichnis** `/sinndiskret`.
   Notiere vorher, worauf die Domain bisher zeigt. So kannst du jederzeit zurück.
3. Das Gleiche für `www.sinndiskret.de`, falls separat aufgeführt.
4. Wenn SSL für beide Domains aktiv ist: In `public/.htaccess` die HTTPS-Weiterleitung aktivieren (Rauten vor den vier Zeilen entfernen).

---

## Google Search Console (optional)

1. https://search.google.com/search-console öffnen → **Property hinzufügen** → **URL-Präfix** → `https://sinndiskret.de/`.
2. Bestätigungsmethode **HTML-Tag** wählen und das angezeigte `<meta name="google-site-verification" …>` kopieren.
3. Den Tag in `public/index.html` direkt unter `<meta name="theme-color" …>` einfügen (oder Claude schicken), über `dev` live stellen, dann in der Search Console **Bestätigen** klicken.
4. Unter **Sitemaps** `sitemap.xml` eintragen.

Alte Adressen der früheren WordPress-Seite (z. B. `/coaching-freiburg/`) leitet `public/.htaccess` dauerhaft auf die passenden Abschnitte der Startseite um.

## Woran erkenne ich, dass der Deploy geklappt hat?

1. **GitHub → Actions:** Der neueste Lauf hat einen **grünen Haken**. Im Lauf steht unten in der Zusammenfassung die Prüf-Adresse.
2. **version.txt im Browser öffnen:**
   - https://test.sinndiskret.de/version.txt
   - https://sinndiskret.de/version.txt

   Dort stehen Branch, Commit und Uhrzeit des letzten Uploads. Stimmt die Uhrzeit mit deinem Merge überein, ist alles live.
3. Die Seite selbst sieht alt aus? Den Browser-Cache leeren bzw. auf dem Handy die Seite neu laden.

## Fehlersuche

| Symptom im Actions-Log | Ursache / Lösung |
|---|---|
| `Login failed` / `Login incorrect` | Benutzername oder Passwort in den Secrets falsch. Neu setzen (Schritt 3). |
| `Name or service not known` / Timeout | `SFTP_SERVER` falsch geschrieben. Genau so übernehmen, wie er bei STRATO unter „SFTP & SSH“ steht. |
| `No such file or directory` | Ordner `sinndiskret` bzw. `sinndiskret-test` fehlt (Schritt 2). |
| Haken grün, aber Seite zeigt alten Stand | Domain zeigt auf falschen Ordner (Schritt 6/7) oder Browser-Cache. |
| Seite zeigt „500 Internal Server Error“ | Meist eine Zeile in `.htaccess`, die der Server nicht kennt. Letzte Änderung an `.htaccess` rückgängig machen. |

## Ordnerstruktur

```
public/                  → wird hochgeladen
  index.html             Startseite (Platzhalter)
  impressum.html         Impressum (Platzhalter)
  datenschutz.html       Datenschutz (Platzhalter)
  404.html               Seite „nicht gefunden“
  css/style.css          Gestaltung
  favicon.svg            Symbol im Browser-Tab
  robots.txt             Hinweise für Suchmaschinen
  sitemap.xml            Seitenübersicht für Suchmaschinen
  .htaccess              Server-Einstellungen (Apache)
.github/workflows/
  deploy.yml             automatischer Upload zu STRATO (SFTP)
README.md                diese Anleitung
```

## Hinweise

- Keine Tracker, keine Cookies, keine externen Schriften oder Skripte. Alles wird von STRATO ausgeliefert.
- Impressum und Datenschutz sind Platzhalter und müssen **vor dem Livegang** ausgefüllt werden. Für Heilpraktiker gehören Berufsbezeichnung, zuständige Aufsichtsbehörde und berufsrechtliche Regelungen ins Impressum. Werbende Texte unterliegen dem Heilmittelwerbegesetz (HWG).
