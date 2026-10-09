# SinnDiskret

Website **sinndiskret.de** – statische Seiten (HTML/CSS), gehostet bei STRATO.
Änderungen im Repo werden automatisch per GitHub Actions zu STRATO hochgeladen.

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
3. Passt alles: PR von `dev` nach `main` öffnen und mergen → Änderung ist auf **sinndiskret.de**.

Kleine Textänderungen kannst du auch selbst machen: Datei in GitHub öffnen → Stift-Symbol → ändern → unten „Commit changes“ → „Create a new branch … and start a pull request“ → als Ziel (`base`) `dev` wählen.

---

## Einmalige Einrichtung (nur im Browser)

> Die Bezeichnungen im STRATO-Menü ändern sich gelegentlich. Wenn ein Menüpunkt anders heißt, such nach dem fett gedruckten Begriff.

### Schritt 1: FTP-Zugang bei STRATO finden

1. Bei https://www.strato.de/apps/CustomerService einloggen.
2. Dein Paket „Hosting Plus“ auswählen.
3. Unter **Hosting** den Bereich **SFTP/FTP-Zugänge** (oder „FTP-Benutzer“) öffnen.
4. Notiere dir:
   - **Server:** `ftp.strato.de`
   - **Benutzername:** steht dort, meist deine Domain oder eine Kennung
   - **Passwort:** Falls du es nicht mehr weißt, dort ein neues setzen.

Tipp: Wenn STRATO dir anbietet, einen **zusätzlichen FTP-Benutzer** anzulegen, ist das für GitHub die bessere Wahl. Dann kannst du ihn jederzeit sperren, ohne deinen Hauptzugang zu ändern. Er muss Zugriff auf das Hauptverzeichnis `/` haben, damit er beide Ordner erreicht.

### Schritt 2: Ordner anlegen

1. Im STRATO-Menü unter **Hosting** den **Webspace-Explorer** bzw. **Dateimanager** öffnen.
2. Im obersten Verzeichnis (`/`) zwei Ordner anlegen:
   - `sinndiskret`
   - `sinndiskret-test`
3. Falls `sinndiskret` schon existiert und Dateien enthält: Diese erst herunterladen (Sicherung). Der Upload überschreibt gleichnamige Dateien.

### Schritt 3: GitHub Secrets anlegen

1. Im Repo auf GitHub: **Settings** → links **Secrets and variables** → **Actions**.
2. Dreimal **New repository secret** anlegen:

| Name | Wert |
|---|---|
| `FTP_SERVER`   | `ftp.strato.de` |
| `FTP_USERNAME` | dein FTP-Benutzername aus Schritt 1 |
| `FTP_PASSWORD` | dein FTP-Passwort aus Schritt 1 |

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
| `530 Login incorrect` | Benutzername oder Passwort in den Secrets falsch. Neu setzen (Schritt 3). |
| `ENOTFOUND` / Timeout | `FTP_SERVER` falsch geschrieben. Muss genau `ftp.strato.de` sein. |
| Fehler mit „certificate“ / TLS | Bei mir melden. Dann wird die Verschlüsselungseinstellung angepasst. |
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
  .htaccess              Server-Einstellungen (Apache)
.github/workflows/
  deploy.yml             automatischer Upload zu STRATO
README.md                diese Anleitung
```

## Hinweise

- Keine Tracker, keine Cookies, keine externen Schriften oder Skripte. Alles wird von STRATO ausgeliefert.
- Impressum und Datenschutz sind Platzhalter und müssen **vor dem Livegang** ausgefüllt werden. Für Heilpraktiker gehören Berufsbezeichnung, zuständige Aufsichtsbehörde und berufsrechtliche Regelungen ins Impressum. Werbende Texte unterliegen dem Heilmittelwerbegesetz (HWG).
