import { tool } from "ai";
import { z } from "zod";
import { callToolsServer } from "./client";

export const searchTool = tool({
  description:
    "Search the web using SearXNG and return relevant results (titles and URLs).",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .max(500)
      .describe("Search query string"),
    max_results: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .describe("Maximum number of search results"),
  }),
  execute: async ({ query, max_results }) => {
    return await callToolsServer<unknown>("/api/v1/search/search", {
      query,
      max_results,
    });
  },
});
