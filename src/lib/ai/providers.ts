/** AI providers the admin assistant can talk to. Safe to import from client components (no secrets here). */

export type ProviderKind = "gemini" | "openai" | "anthropic";

export type Provider = {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl?: string;
  free: boolean;
  note: string;
  keyUrl: string;
  env: string;
  models: { id: string; label: string }[];
};

export const PROVIDERS: Provider[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    kind: "gemini",
    free: true,
    note: "Free tier — best place to start. Supports tools natively.",
    keyUrl: "https://aistudio.google.com/apikey",
    env: "GEMINI_API_KEY",
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (free)" },
      { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite (free, fastest)" },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (free, low limits)" },
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (free)" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    kind: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    free: true,
    note: "One key, many free models (DeepSeek, Llama, Qwen, OpenAI gpt-oss…). Free models end in “:free”.",
    keyUrl: "https://openrouter.ai/keys",
    env: "OPENROUTER_API_KEY",
    models: [
      { id: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek V3 (free)" },
      { id: "openai/gpt-oss-120b:free", label: "OpenAI gpt-oss-120B (free)" },
      { id: "openai/gpt-oss-20b:free", label: "OpenAI gpt-oss-20B (free)" },
      { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (free)" },
      { id: "qwen/qwen3-235b-a22b:free", label: "Qwen3 235B (free)" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    kind: "openai",
    baseUrl: "https://api.groq.com/openai/v1",
    free: true,
    note: "Free tier, very fast. Llama, Qwen and gpt-oss.",
    keyUrl: "https://console.groq.com/keys",
    env: "GROQ_API_KEY",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (free)" },
      { id: "openai/gpt-oss-120b", label: "OpenAI gpt-oss-120B (free)" },
      { id: "qwen/qwen3-32b", label: "Qwen3 32B (free)" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    kind: "openai",
    baseUrl: "https://api.deepseek.com/v1",
    free: false,
    note: "Very cheap, pay-as-you-go (no free API tier).",
    keyUrl: "https://platform.deepseek.com/api_keys",
    env: "DEEPSEEK_API_KEY",
    models: [{ id: "deepseek-chat", label: "DeepSeek Chat (V3)" }],
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    kind: "openai",
    baseUrl: "https://api.openai.com/v1",
    free: false,
    note: "Paid API (a ChatGPT subscription does not include API access).",
    keyUrl: "https://platform.openai.com/api-keys",
    env: "OPENAI_API_KEY",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
      { id: "gpt-4.1", label: "GPT-4.1" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    kind: "anthropic",
    free: false,
    note: "Paid API (a Claude.ai subscription does not include API access).",
    keyUrl: "https://console.anthropic.com/settings/keys",
    env: "ANTHROPIC_API_KEY",
    models: [
      { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 (fast, cheapest)" },
      { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5" },
    ],
  },
  {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    kind: "openai",
    free: false,
    note: "Any OpenAI-compatible endpoint — Ollama, LM Studio, Together, Mistral… Set the base URL below.",
    keyUrl: "",
    env: "CUSTOM_AI_API_KEY",
    models: [],
  },
];

export const providerById = (id: string) => PROVIDERS.find((p) => p.id === id);
