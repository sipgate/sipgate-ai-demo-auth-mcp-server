# MCP Auth Demo — Vertragsinformationen per PIN

MCP Server mit PIN-Authentifizierung für Vertragsdaten. Gedacht als Demo für Voice-Assistants die über das Model Context Protocol Kundendaten abfragen.

## Architektur

```
Voice-Assistant
      │
      ▼
MCP Server (NestJS, :8088)     ──REST──►     Mock Auth Service (Express, :3001)
   /mcp                                       POST /auth/verify-pin
   Tools:                                     GET  /contracts
   • authenticate(code)                       GET  /contracts/:id
   • get-contracts()
   • get-contract-details(contractId)
```

Der MCP Server stellt drei Tools bereit. Der Mock Auth Service simuliert eine externe API mit PIN-Validierung und JWT-Token-Rückgabe.

## Quick Start

```bash
npm install
cp .env.example .env
```

### Lokal starten

In zwei separaten Terminals:

```bash
# Terminal 1: Mock Auth Service
npm run start:mock

# Terminal 2: MCP Server
npm run start:dev
```

Der MCP Server läuft auf `http://localhost:8088/mcp`, der Mock Service auf `http://localhost:3001`.

### Mit Tunnel ins Internet

Damit ein externer Voice-Assistant die Services erreichen kann:

```bash
# Voraussetzung: cloudflared installieren (einmalig)
brew install cloudflared

# Beide Services + Tunnel starten
./start-tunnel.sh
```

Das Script startet Mock Service, MCP Server und je einen Cloudflare-Tunnel. Am Ende werden die öffentlichen URLs angezeigt. Die MCP-Endpoint-URL wird dem Voice-Assistant übergeben. Stoppen mit `Ctrl+C`.

## Projekt-Struktur

```
src/
├── main.ts                 # NestJS Bootstrap
├── app.module.ts           # Modul-Konfiguration
├── api-key.guard.ts        # Bearer Token Auth für /mcp
├── health.controller.ts    # GET /health
├── mock-service/
│   ├── data.ts             # Mock-Kunden und Vertragsdaten
│   └── server.ts           # Express REST API (eigenständig)
└── tools/
    ├── auth.tool.ts        # MCP Tool: authenticate (mit Spracherkennung)
    └── contract.tool.ts    # MCP Tools: get-contracts, get-contract-details
```

## Auth-Flow

1. Voice-Assistant ruft `authenticate(code: "eins zwei drei vier")` auf
2. MCP Server konvertiert gesprochene Zahlen zu Ziffern (`"1234"`)
3. MCP Server sendet PIN an Mock Service (`POST /auth/verify-pin`)
4. Mock Service validiert PIN und gibt JWT-Token zurück
5. MCP Server speichert Token für nachfolgende Requests
6. Vertragsdaten-Tools nutzen das Token für autorisierte Requests an den Mock Service

## Konfiguration

Alle Einstellungen über `.env` (siehe `.env.example`):

| Variable | Default | Beschreibung |
|---|---|---|
| `MCP_SERVER_NAME` | `contract-auth-service` | Server-Name im MCP Handshake |
| `MCP_SERVER_VERSION` | `1.0.0` | Server-Version |
| `PORT` | `8088` | HTTP Port des MCP Servers |
| `AUTH_BEARER_TOKEN` | _(leer)_ | Bearer Token für `/mcp` Endpoint (leer = offen) |
| `CORS_ORIGIN` | `*` | Erlaubte CORS Origin |
| `MOCK_SERVICE_PORT` | `3001` | Port des Mock Auth Service |
| `MOCK_SERVICE_URL` | `http://localhost:3001` | URL des Mock Auth Service |

## Test-Daten

| Kunde | PIN | Verträge |
|---|---|---|
| Max Mustermann | 1234 | Allnet Flat L, Data Only M |
| Erika Musterfrau | 5678 | Allnet Flat S (expired), Allnet Flat XL |
| Hans Beispiel | 9999 | Prepaid Basic |

## Manuell testen

```bash
# MCP Session starten
curl -X POST http://localhost:8088/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'

# Authentifizieren
curl -X POST http://localhost:8088/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"authenticate","arguments":{"code":"1234"}}}'

# Verträge abrufen
curl -X POST http://localhost:8088/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get-contracts","arguments":{}}}'
```

## Docker

```bash
./start.sh
```
