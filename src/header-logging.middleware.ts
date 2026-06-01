import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class HeaderLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HeaderLoggingMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    const headers = { ...req.headers };

    if (headers["authorization"]) {
      const auth = headers["authorization"] as string;
      headers["authorization"] = auth.startsWith("Bearer ")
        ? `Bearer ${auth.slice(7, 12)}…`
        : "***";
    }

    this.logger.log(
      `Incoming ${req.method} ${req.path} — headers: ${JSON.stringify(headers)}`,
    );

    next();
  }
}
