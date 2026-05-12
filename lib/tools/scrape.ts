import { tool } from "ai";
import { z } from "zod";
import { callToolsServer } from "./client";

export const scrapeTool = tool({
  description:
    "Extract and parse content from one or multiple web pages. Returns extracted content in processable chunks.",
  inputSchema: z.object({
    urls: z
      .array(z.string().url())
      .min(1)
      .max(50)
      .describe("List of URLs to scrape (single or multiple)"),
    chunk_size: z
      .number()
      .int()
      .min(100)
      .max(10000)
      .default(2000)
      .describe("Size of text chunks"),
    max_workers: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(5)
      .describe("Number of parallel workers for multiple URLs"),
  }),
  execute: async ({ urls, chunk_size, max_workers }) => {
    return await callToolsServer<unknown>("/api/v1/search/scrape", {
      urls,
      chunk_size,
      max_workers,
    });
  },
});
