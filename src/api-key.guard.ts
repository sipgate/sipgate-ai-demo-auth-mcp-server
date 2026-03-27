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
    const expectedKey = process.env.API_KEY;

    if (!expectedKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const providedKey =
      request.headers["x-api-key"] ?? request.query?.api_key;

    if (!providedKey || providedKey !== expectedKey) {
      this.logger.warn(`Unauthorized request from ${request.ip}`);
      throw new UnauthorizedException("Invalid or missing API key");
    }

    return true;
  }
}
