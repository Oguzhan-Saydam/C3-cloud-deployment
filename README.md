# C3 Cloud Deployment - Task Manager App

## Was ist dieses Projekt?

Das ist eine einfache Task Manager App.

Der Benutzer kann:

- alle Tasks sehen
- einen neuen Task erstellen
- einen Task als erledigt markieren
- einen Task löschen

Die App hat ein Frontend, ein Backend und eine PostgreSQL Datenbank.

Dieses Projekt wurde zuerst für die lokale Docker Aufgabe gemacht. Für C3 habe ich es in die Cloud mit Render deployed.

## Öffentliche URLs

Frontend:

```text
https://c3-cloud-deployment-1.onrender.com
```

Backend API:

```text
https://c3-cloud-deployment.onrender.com
```

Health Check:

```text
https://c3-cloud-deployment.onrender.com/health
```

Tasks API:

```text
https://c3-cloud-deployment.onrender.com/tasks
```

## Verwendete Plattform

Ich habe Render für das Deployment benutzt.

Ich habe Render gewählt, weil es relativ einfach zu benutzen ist. Render kann sich direkt mit GitHub verbinden und die App nach einem Git Push deployen. Render unterstützt auch Web Services, Static Sites, PostgreSQL Datenbanken, Environment Variables und Logs.

Das war für dieses Projekt praktisch, weil ich Frontend Hosting, Backend Hosting und eine persistente Datenbank gebraucht habe.

## Architektur

```text
User Browser
     |
     v
Render Static Site
React / Vite Frontend
     |
     v
Render Web Service
Node.js / Express Backend
     |
     v
Render PostgreSQL Datenbank
```

Das Frontend wird als Static Site auf Render gehostet.

Das Backend wird als Web Service auf Render gehostet.

Die Datenbank ist eine PostgreSQL Datenbank auf Render.

Das Frontend spricht mit dem Backend über die öffentliche Backend URL. Das Backend spricht mit der Datenbank über die interne Datenbank URL von Render.

## Projektstruktur

```text
project/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Environment Variables

Die echten Secrets sind nicht im GitHub Repository.

Das Projekt hat eine `.env.example` Datei, damit man sieht, welche Variablen gebraucht werden.

Beispiel:

```env
POSTGRES_USER=appuser
POSTGRES_PASSWORD=apppassword
POSTGRES_DB=tasksdb
DATABASE_URL=postgres://appuser:apppassword@database:5432/tasksdb
BACKEND_PORT=3000
VITE_API_URL=http://localhost:3001
```

Auf Render habe ich diese Variablen benutzt:

Backend Web Service:

```env
DATABASE_URL=<Render internal PostgreSQL database URL>
PORT=3000
```

Frontend Static Site:

```env
VITE_API_URL=https://c3-cloud-deployment.onrender.com
```

Die echte `DATABASE_URL` ist nur in Render gespeichert und nicht in GitHub.

## Lokales Setup

Zuerst das Repository klonen:

```bash
git clone <repository-url>
cd <repository-folder>
```

Eine `.env` Datei aus dem Beispiel erstellen:

```bash
cp .env.example .env
```

Die App lokal mit Docker Compose starten:

```bash
docker compose up --build
```

Danach sollte die App lokal laufen.

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3001
```

Health Check:

```text
http://localhost:3001/health
```

## Deployment Schritte auf Render

### 1. PostgreSQL Datenbank

Zuerst habe ich eine PostgreSQL Datenbank auf Render erstellt.

Einstellungen:

```text
Name: c3-task-db
Database: tasksdb
User: appuser
Region: Frankfurt
Plan: Free
```

Nachdem die Datenbank erstellt wurde, habe ich die interne Datenbank URL kopiert.

Diese URL wird vom Backend als `DATABASE_URL` benutzt.

### 2. Backend Web Service

Danach habe ich einen neuen Web Service auf Render erstellt.

Einstellungen:

```text
Name: c3-cloud-deployment
Environment: Docker
Branch: main
Root Directory: backend
Dockerfile Path: ./Dockerfile
```

Environment Variables:

```env
DATABASE_URL=<Render internal PostgreSQL database URL>
PORT=3000
```

Nach dem Deployment habe ich das Backend getestet mit:

```text
https://c3-cloud-deployment.onrender.com/health
```

und:

```text
https://c3-cloud-deployment.onrender.com/tasks
```

### 3. Frontend Static Site

Danach habe ich eine Static Site auf Render erstellt.

Einstellungen:

```text
Name: c3-cloud-deployment
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment Variable:

```env
VITE_API_URL=https://c3-cloud-deployment.onrender.com
```

Weil das Backend schon den gleichen Namen benutzt hat, hat Render bei der Frontend URL `-1` hinzugefügt.

Frontend URL:

```text
https://c3-cloud-deployment-1.onrender.com
```

## Re-Deployment

Render ist mit dem GitHub Repository verbunden.

Wenn ich einen neuen Commit auf den `main` Branch pushe, kann Render automatisch die neue Version deployen.

Beispiel:

```bash
git add .
git commit -m "Update project"
git push
```

Nach dem Push startet Render ein neues Deployment.

Falls nötig, kann ich es auch manuell in Render starten mit:

```text
Manual Deploy -> Deploy latest commit
```

## Persistente Daten

Die App benutzt eine PostgreSQL Datenbank auf Render.

Tasks werden in der Datenbank gespeichert. Das bedeutet, die Daten verschwinden nicht, wenn das Backend neu startet oder wenn die App neu deployed wird.

Ich habe das getestet, indem ich einen Task erstellt habe, die Frontend Seite neu geladen habe und geprüft habe, ob der Task noch da ist.

## Logs

Das Backend schreibt strukturierte Logs mit JSON.

Beispiel:

```json
{
  "level": "info",
  "message": "Task created",
  "taskId": 1
}
```

Die Logs kann man in Render beim Backend Web Service im Logs Bereich sehen.

Das ist hilfreich, weil ich sehen kann, ob das Backend richtig gestartet ist und ob Requests ankommen.

## Wichtige Entscheidungen

### Warum Render?

Ich habe Render benutzt, weil ich dort alles an einem Ort habe:

- Frontend Hosting
- Backend Hosting
- PostgreSQL Datenbank
- Environment Variables
- Logs
- GitHub Deployment

Für diese Schulaufgabe war das einfacher als einen eigenen Server zu benutzen.

### Warum PostgreSQL?

Ich habe PostgreSQL benutzt, weil die App persistente Speicherung braucht. Ein normales Array im Backend wäre einfacher, aber die Daten würden nach einem Neustart verschwinden.

Mit PostgreSQL bleiben die Tasks gespeichert.

### Warum Environment Variables?

Ich habe Environment Variables benutzt, weil Secrets und Konfiguration nicht direkt im Code stehen sollen.

Die Datenbank URL ist privat und nur in Render gespeichert.

## Probleme, die ich hatte

Ein Problem war, dass das Frontend zuerst eine lokale Backend URL benutzt hat:

```js
http://localhost:3001
```

Das funktioniert lokal, aber nicht nach dem Deployment.

Ich habe es geändert, damit eine Vite Environment Variable benutzt wird:

```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
```

Ein anderes kleines Problem war, dass Render nach dem Deployment etwas Zeit gebraucht hat. Am Anfang haben manche Routen nicht direkt funktioniert, aber nach Warten und Refreshen hat das Backend funktioniert.

## Was ich gelernt habe

Ich habe gelernt, wie man eine Fullstack App auf eine Cloud Plattform deployed.

Ich habe auch gelernt, dass Frontend und Backend in Production verschiedene URLs brauchen.

Ich habe besser verstanden, warum Environment Variables wichtig sind und warum Secrets nicht auf GitHub gepusht werden sollen.

Ich habe auch gelernt, wie man einen Backend Service mit einer Cloud PostgreSQL Datenbank verbindet.

## Was ich nächstes Mal anders machen würde

Nächstes Mal würde ich von Anfang an klarere Service Namen wählen, zum Beispiel:

```text
c3-task-backend
c3-task-frontend
c3-task-db
```

Dann müsste Render nicht `-1` zu einer URL hinzufügen.

Ich würde auch die Frontend API URL früher vorbereiten, weil hardcoded localhost URLs schlecht für Deployment sind.

## AI Tools

Ich habe ChatGPT als Hilfe benutzt, um die Aufgabe zu verstehen, Deployment Probleme zu lösen und Teile der Dokumentation zu schreiben.

Ich habe den generierten Code und die Commands selbst geprüft und die deployte App auf Render getestet.