import { Injectable, Logger } from "@nestjs/common";
import { Context, Tool } from "@rekog/mcp-nest";
import axios from "axios";
import z from "zod";
import { AuthTool } from "./auth.tool";

const MOCK_SERVICE_URL =
  process.env.MOCK_SERVICE_URL ?? "http://localhost:3001";

@Injectable()
export class ContractTool {
  private readonly logger = new Logger(ContractTool.name);

  constructor(private readonly authTool: AuthTool) {}

  private getAuthHeaders(): Record<string, string> | null {
    const token = this.authTool.getToken();
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }

  @Tool({
    name: "get-contracts",
    description:
      "Lists all contracts of the authenticated customer. Requires prior authentication via PIN.",
    parameters: z.object({
      sessionId: z
        .string()
        .describe(
          "The sessionId from the conversation context (contextInfo). Pass the value exactly as stated in the context. ",
        ),
    }),
  })
  async getContracts(
    { sessionId }: { sessionId: string },
    _context: Context,
  ) {
    const headers = this.getAuthHeaders();

    if (!headers) {
      return "Not authenticated. Please authenticate first using your PIN.";
    }

    try {
      this.logger.log(`Fetching contracts from mock service (sessionId: "${sessionId}")`);
      const response = await axios.get(`${MOCK_SERVICE_URL}/contracts`, {
        headers,
      });

      if (response.data.contracts.length === 0) {
        return "No contracts found.";
      }

      return JSON.stringify(response.data.contracts, null, 2);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return "Session expired. Please authenticate again.";
      }
      this.logger.error("Mock service error", error);
      return "Contract service is unavailable. Please try again later.";
    }
  }

  @Tool({
    name: "get-contract-details",
    description:
      "Retrieves detailed information about a specific contract. Requires prior authentication via PIN.",
    parameters: z.object({
      contractId: z.string().describe("The contract ID (e.g. V-2001)"),
      sessionId: z
        .string()
        .describe(
          "The sessionId from the conversation context (contextInfo). Pass the value exactly as stated in the context. ",
        ),
    }),
  })
  async getContractDetails(
    { contractId, sessionId }: { contractId: string; sessionId: string },
    _context: Context,
  ) {
    const headers = this.getAuthHeaders();

    if (!headers) {
      return "Not authenticated. Please authenticate first using your PIN.";
    }

    try {
      this.logger.log(`Fetching contract ${contractId} from mock service (sessionId: "${sessionId}")`);
      const response = await axios.get(
        `${MOCK_SERVICE_URL}/contracts/${contractId}`,
        { headers },
      );

      return JSON.stringify(response.data.contract, null, 2);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return "Session expired. Please authenticate again.";
        }
        if (error.response?.status === 404) {
          return `No contract found with ID ${contractId}.`;
        }
      }
      this.logger.error("Mock service error", error);
      return "Contract service is unavailable. Please try again later.";
    }
  }
}
