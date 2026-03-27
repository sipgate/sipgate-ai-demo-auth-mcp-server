# MCP Server Template

Template for building [Model Context Protocol](https://modelcontextprotocol.io/) servers with NestJS, deployable to Google Cloud Run.

## Quick Start

```bash
npm install
cp .env.example .env
npm run start:dev
```

The server starts on `http://localhost:8088`:

- **MCP endpoint:** `POST /mcp`
- **Health check:** `GET /health`

## Project Structure

```
src/
├── main.ts              # Server bootstrap
├── app.module.ts        # Module & tool registration
├── api-key.guard.ts     # Optional API key auth
├── health.controller.ts # Health check endpoint
└── tools/
    └── example.tool.ts  # Example: REST API tool (list + create)
```

## Creating a Tool

1. Create a file in `src/tools/`:

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { Tool, Context } from "@rekog/mcp-nest";
import z from "zod";

@Injectable()
export class MyTool {
  private readonly logger = new Logger(MyTool.name);

  @Tool({
    name: "my-tool",
    description: "What this tool does",
    parameters: z.object({
      input: z.string().describe("What this parameter is for"),
    }),
  })
  async run({ input }: { input: string }, _context: Context) {
    this.logger.log(`Called with: ${input}`);
    return "result";
  }
}
```

2. Register in `app.module.ts`:

```typescript
import { MyTool } from "./tools/my.tool";

providers: [
  // ...
  MyTool,
],
```

Done — the tool is available via MCP.

**How to organize tools:** Group related operations in one file per domain/API. A single class can have multiple `@Tool()` methods that share the same HTTP client and config. Create separate files for unrelated domains:

```
src/tools/
├── jira.tool.ts       ← all Jira operations (list, create, update)
├── calendar.tool.ts   ← all calendar operations
└── slack.tool.ts      ← all Slack operations
```

## Configuration

All settings via environment variables (see `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `MCP_SERVER_NAME` | `my-mcp-server` | Server name in MCP handshake |
| `MCP_SERVER_VERSION` | `1.0.0` | Server version |
| `PORT` | `8088` | HTTP port |
| `API_KEY` | _(empty)_ | Protect `/mcp` endpoint (empty = open) |
| `CORS_ORIGIN` | `*` | Allowed CORS origin |

## Docker & Cloud Run

```bash
# Local Docker
./start.sh

# Deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/my-mcp-server

gcloud run deploy my-mcp-server \
  --image gcr.io/PROJECT_ID/my-mcp-server \
  --region europe-west3 \
  --port 8088 \
  --set-env-vars "MCP_SERVER_NAME=my-mcp-server"
```

## License

MIT
