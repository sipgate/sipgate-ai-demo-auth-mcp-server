import { randomUUID } from "crypto";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { McpModule } from "@rekog/mcp-nest";

import { ApiKeyGuard } from "./api-key.guard";
import { HeaderLoggingMiddleware } from "./header-logging.middleware";
import { HealthController } from "./health.controller";
import { AuthTool } from "./tools/auth.tool";
import { ContractTool } from "./tools/contract.tool";

@Module({
  imports: [
    McpModule.forRoot({
      name: process.env.MCP_SERVER_NAME ?? "contract-auth-service",
      version: process.env.MCP_SERVER_VERSION ?? "1.0.0",
      streamableHttp: {
        statelessMode: true,
        sessionIdGenerator: () => randomUUID(),
      },
    }),
  ],

  controllers: [HealthController],

  providers: [
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    AuthTool,
    ContractTool,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HeaderLoggingMiddleware).forRoutes("*");
  }
}
