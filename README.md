# Task Manager CI/CD

## Aufgabe C2: CI/CD mit GitHub Actions

Für diese Aufgabe habe ich mein Projekt aus C1 als Basis benutzt.  
Das Projekt besteht aus einem Backend, einem Frontend und einer PostgreSQL-Datenbank mit Docker Compose.

In C2 habe ich eine GitHub Actions Pipeline erstellt. Die Pipeline startet automatisch, wenn Code auf den `main` Branch gepusht wird.

Die Workflow-Datei befindet sich hier:

```text
.github/workflows/ci-cd.yml
```

## Pipeline Übersicht

Die Pipeline hat diese Schritte:

```text
Push auf main
   |
   v
Repository auschecken
   |
   v
Backend Dependencies installieren
   |
   v
Backend Tests ausführen
   |
   v
Frontend Dependencies installieren
   |
   v
Frontend Tests ausführen
   |
   v
Frontend Lint ausführen
   |
   v
Backend Docker Image bauen und pushen
   |
   v
Frontend Docker Image bauen und pushen
```

Wenn ein Schritt fehlschlägt, stoppt die Pipeline. Dann werden die Docker Images nicht gepusht.

## Build

Für das Backend wird ein Docker Image gebaut und für das Frontend wird auch ein Docker Image gebaut.

### Backend Image

```text
ghcr.io/oguzhan-saydam/task-manager-backend
```

### Frontend Image

```text
ghcr.io/oguzhan-saydam/task-manager-frontend
```

Die Images werden aus diesen Dockerfiles gebaut:

```text
backend/Dockerfile
frontend/Dockerfile
```

## Test

Im Backend wird dieser Befehl ausgeführt:

```bash
npm test --if-present
```

Im Frontend werden diese Befehle ausgeführt:

```bash
npm test --if-present
npm run lint --if-present
```

`--if-present` bedeutet, dass der Befehl nur ausgeführt wird, wenn er im `package.json` vorhanden ist.

## Push / Registry

Als Registry benutze ich GitHub Container Registry, also GHCR.

Ich habe GHCR gewählt, weil es direkt zu GitHub gehört und gut mit GitHub Actions funktioniert. Für dieses Projekt brauche ich keinen extra Docker Hub Account.

Die Images werden nach einem erfolgreichen Build in GHCR veröffentlicht.

## Tagging Strategie

Jedes Image bekommt mindestens zwei Tags:

```text
latest
Git Commit SHA
```

Beispiel:

```text
ghcr.io/oguzhan-saydam/task-manager-backend:latest
ghcr.io/oguzhan-saydam/task-manager-backend:<commit-sha>
```

`latest` ist einfach lesbar.  
Der Commit SHA ist eindeutig und nachvollziehbar. Damit kann ich später sehen, aus welchem Commit das Image gebaut wurde.

## Trigger

Die Pipeline startet automatisch bei jedem Push auf den `main` Branch:

```yaml
on:
  push:
    branches:
      - main
```

Die Pipeline kann auch manuell gestartet werden:

```yaml
workflow_dispatch:
```

Das ist praktisch zum Testen.

## Secrets

Es werden keine Secrets direkt im Repository gespeichert.

Für GHCR wird das eingebaute GitHub Secret benutzt:

```text
GITHUB_TOKEN
```

Dieses Token wird von GitHub automatisch bereitgestellt. Es wird nur während der Pipeline benutzt.

Die `.env` Datei wird nicht ins Repository gepusht. Im Repository gibt es nur eine `.env.example` Datei mit Beispielwerten.

## Caching

Für Docker wird der GitHub Actions Cache benutzt:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

Dadurch kann Docker alte Layers wiederverwenden. Wenn sich nicht viel am Code ändert, sollte der nächste Build schneller sein als der erste Build.

## Wichtige Entscheidungen

Ich habe zwei Images gebaut, weil mein Projekt aus Backend und Frontend besteht. So können beide Teile getrennt versioniert und veröffentlicht werden.

Ich habe GHCR als Registry gewählt, weil es einfach mit GitHub Actions funktioniert und keine extra Login-Daten im Repository benötigt.

Ich benutze `latest` und den Commit SHA als Tags. `latest` ist einfach zu lesen und der Commit SHA ist eindeutig.

## Reflexion

Ich habe gelernt, wie GitHub Actions nach einem Push automatisch eine Pipeline startet.  
Am Anfang ist die Pipeline wegen einem Lint-Fehler fehlgeschlagen. Das war hilfreich, weil man sehen konnte, dass die Pipeline Fehler erkennt und dann stoppt.

Danach gab es noch ein Problem mit dem Image-Namen, weil Docker Registry Namen klein geschrieben sein müssen. Deshalb wird der GitHub Benutzername in der Pipeline in Kleinbuchstaben umgewandelt.

Rückblickend würde ich früher darauf achten, dass Docker Image Namen immer klein geschrieben sind. Ausserdem würde ich von Anfang an einfache Tests im Backend und Frontend einbauen, damit die Test-Stage noch sinnvoller ist.

## KI-Deklaration

Ich habe KI als Hilfe benutzt, um die Aufgabenstellung besser zu verstehen, die GitHub Actions Pipeline zu planen und Fehler in der Pipeline zu erklären.  
Den Code und die Konfiguration habe ich geprüft und angepasst.