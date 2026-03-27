import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const expectedToken = process.env.AUTH_BEARER_TOKEN;

    if (!expectedToken) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (!authHeader?.startsWith("Bearer ")) {
      this.logger.warn(`Missing Bearer token from ${request.ip}`);
      throw new UnauthorizedException("Bearer token required");
    }

    const token = authHeader.slice(7);

    if (token !== expectedToken) {
      this.logger.warn(`Invalid Bearer token from ${request.ip}`);
      throw new UnauthorizedException("Invalid Bearer token");
    }

    return true;
  }
}
