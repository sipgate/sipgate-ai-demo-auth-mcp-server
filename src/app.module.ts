import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { McpModule } from "@rekog/mcp-nest";

import { ApiKeyGuard } from "./api-key.guard";
import { HealthController } from "./health.controller";
import { ExampleTool } from "./tools/example.tool";

@Module({
  imports: [
    McpModule.forRoot({
      name: process.env.MCP_SERVER_NAME ?? "my-mcp-server",
      version: process.env.MCP_SERVER_VERSION ?? "1.0.0",
    }),
  ],

  controllers: [HealthController],

  providers: [
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    ExampleTool,
  ],
})
export class AppModule {}
