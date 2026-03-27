import { Injectable, Logger } from "@nestjs/common";
import { Tool, Context } from "@rekog/mcp-nest";
import axios from "axios";
import z from "zod";

const MOCK_SERVICE_URL =
  process.env.MOCK_SERVICE_URL ?? "http://localhost:3001";

const SPOKEN_DIGITS: Record<string, string> = {
  null: "0",
  zero: "0",
  eins: "1",
  ein: "1",
  eine: "1",
  one: "1",
  zwei: "2",
  zwo: "2",
  two: "2",
  drei: "3",
  three: "3",
  vier: "4",
  four: "4",
  fünf: "5",
  fuenf: "5",
  five: "5",
  sechs: "6",
  six: "6",
  sieben: "7",
  seven: "7",
  acht: "8",
  eight: "8",
  neun: "9",
  nine: "9",
};

function normalizePin(input: string): string {
  const trimmed = input.trim();

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  const words = trimmed.toLowerCase().split(/[\s,.\-]+/);
  const digits = words
    .map((word) => SPOKEN_DIGITS[word])
    .filter((d) => d !== undefined);

  if (digits.length > 0) {
    return digits.join("");
  }

  return trimmed;
}

@Injectable()
export class AuthTool {
  private readonly logger = new Logger(AuthTool.name);
  private token: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  @Tool({
    name: "authenticate",
    description:
      "Authenticates a customer using their personal PIN code. The code can be spoken digits (e.g. 'eins zwei drei vier') or numeric (e.g. '1234'). Must be called before accessing contract data.",
    parameters: z.object({
      code: z
        .string()
        .describe(
          "The customer's PIN code, either as digits or spoken words",
        ),
    }),
  })
  async authenticate({ code }: { code: string }, _context: Context) {
    const pin = normalizePin(code);
    this.logger.log(`Authentication attempt (raw: "${code}", normalized: "${pin}")`);

    try {
      const response = await axios.post(`${MOCK_SERVICE_URL}/auth/verify-pin`, {
        pin,
      });

      this.token = response.data.token;
      return `Authentication successful. Welcome, ${response.data.customerName}.`;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return "Authentication failed. The provided PIN is invalid.";
      }
      this.logger.error("Mock service error", error);
      return "Authentication service is unavailable. Please try again later.";
    }
  }
}
