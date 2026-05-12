import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAlibaba } from "@ai-sdk/alibaba";
import type { LanguageModel } from "ai";

import { env } from "./env";
import { models, type ModelEntry, type ModelId } from "./models";

export { models, DEFAULT_MODEL_ID } from "./models";
export type { ModelEntry, ModelId } from "./models";

const ZEN_BASE_URL = "https://opencode.ai/zen/go/v1";

const openaiCompatible = createOpenAICompatible({
  name: "opencode-zen",
  baseURL: ZEN_BASE_URL,
  apiKey: env.OPENCODE_GO_API_KEY,
});

const anthropic = createAnthropic({
  baseURL: ZEN_BASE_URL,
  apiKey: env.OPENCODE_GO_API_KEY,
});

const alibaba = createAlibaba({
  baseURL: ZEN_BASE_URL,
  apiKey: env.OPENCODE_GO_API_KEY,
});

export function getModel(id: ModelId): LanguageModel {
  const entry = models.find((m) => m.id === id);
  if (!entry) throw new Error(`Unknown model: ${id}`);

  switch (entry.provider) {
    case "openai-compatible":
      return openaiCompatible(entry.id);
    case "anthropic":
      return anthropic(entry.id);
    case "alibaba":
      return alibaba(entry.id);
  }
}
