export type ModelId =
  | "glm-5.1"
  | "glm-5"
  | "kimi-k2.5"
  | "kimi-k2.6"
  | "deepseek-v4-pro"
  | "deepseek-v4-flash"
  | "mimo-v2.5"
  | "mimo-v2.5-pro"
  | "minimax-m2.7"
  | "minimax-m2.5"
  | "qwen3.6-plus"
  | "qwen3.5-plus";

export interface ModelEntry {
  id: ModelId;
  name: string;
  provider: "openai-compatible" | "anthropic" | "alibaba";
}

export const models: ModelEntry[] = [
  { id: "glm-5.1", name: "GLM-5.1", provider: "openai-compatible" },
  { id: "glm-5", name: "GLM-5", provider: "openai-compatible" },
  { id: "kimi-k2.5", name: "Kimi K2.5", provider: "openai-compatible" },
  { id: "kimi-k2.6", name: "Kimi K2.6", provider: "openai-compatible" },
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", provider: "openai-compatible" },
  { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash", provider: "openai-compatible" },
  { id: "mimo-v2.5", name: "MiMo-V2.5", provider: "openai-compatible" },
  { id: "mimo-v2.5-pro", name: "MiMo-V2.5-Pro", provider: "openai-compatible" },
  { id: "minimax-m2.7", name: "MiniMax M2.7", provider: "anthropic" },
  { id: "minimax-m2.5", name: "MiniMax M2.5", provider: "anthropic" },
  { id: "qwen3.6-plus", name: "Qwen3.6 Plus", provider: "alibaba" },
  { id: "qwen3.5-plus", name: "Qwen3.5 Plus", provider: "alibaba" },
];

export const DEFAULT_MODEL_ID: ModelId = "deepseek-v4-flash";
