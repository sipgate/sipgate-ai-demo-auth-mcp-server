import { Injectable, Logger } from "@nestjs/common";
import { Tool, Context } from "@rekog/mcp-nest";
import axios, { AxiosInstance } from "axios";
import z from "zod";

@Injectable()
export class ExampleTool {
  private readonly logger = new Logger(ExampleTool.name);
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: process.env.EXAMPLE_API_URL,
      headers: {
        ...(process.env.EXAMPLE_API_TOKEN
          ? { Authorization: `Bearer ${process.env.EXAMPLE_API_TOKEN}` }
          : {}),
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    });
  }

  @Tool({
    name: "items-list",
    description:
      "List items, optionally filtered by a search term. Returns up to 50 results.",
    parameters: z.object({
      search: z
        .string()
        .optional()
        .describe("Optional search term to filter results"),
      limit: z
        .number()
        .min(1)
        .max(50)
        .default(20)
        .describe("Max number of results (default: 20)"),
    }),
  })
  async list(
    { search, limit }: { search?: string; limit: number },
    _context: Context,
  ) {
    this.logger.log(`Listing items (search=${search}, limit=${limit})`);

    const response = await this.http.get("/items", {
      params: { q: search, limit },
    });

    const items = response.data;

    if (!Array.isArray(items) || items.length === 0) {
      return "No items found.";
    }

    return items
      .map(
        (item: { id: string; name: string }) =>
          `• ${item.name} — ID: ${item.id}`,
      )
      .join("\n");
  }

  @Tool({
    name: "items-create",
    description: "Create a new item. Returns the created item's ID.",
    parameters: z.object({
      name: z.string().describe("Name of the item"),
      description: z.string().optional().describe("Optional description"),
    }),
  })
  async create(
    data: { name: string; description?: string },
    _context: Context,
  ) {
    this.logger.log(`Creating item: ${data.name}`);

    const response = await this.http.post("/items", data);

    return `Item created. ID: ${response.data.id}`;
  }
}
