import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "*",
  });

  const port = parseInt(process.env.PORT ?? "8088", 10);
  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`MCP Server running on port ${port}`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`MCP endpoint: http://localhost:${port}/mcp`);
}

bootstrap();
