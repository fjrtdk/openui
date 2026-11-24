/**
 * Model allowlist for the chat. The server reads it from the environment:
 *
 *   OPENAI_MODEL   the default model (first in the menu when OPENAI_MODELS is unset)
 *   OPENAI_MODELS  optional comma-separated allowlist, e.g.
 *                  "kiro/claude-sonnet-4.5,kiro/claude-haiku-4.5"
 *
 * The browser only ever sends a model id; the server checks it against this
 * list before calling the provider, so a client cannot pick an arbitrary model.
 */

export const FALLBACK_MODEL = "gpt-5.2";

export interface ModelConfig {
  /** The allowed model ids, in menu order, without duplicates. */
  models: string[];
  /** The model used when the client sends none. Always in `models`. */
  defaultModel: string;
}

type Env = Record<string, string | undefined>;

/** Splits a comma-separated list, trimming blanks and dropping duplicates. */
export function parseModelList(raw: string | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const id = part.trim();
    if (id) seen.add(id);
  }
  return [...seen];
}

/** Builds the allowlist and default from the environment. */
export function getModelConfig(env: Env = process.env): ModelConfig {
  const fromEnv = env.OPENAI_MODEL?.trim();
  const list = parseModelList(env.OPENAI_MODELS);
  const defaultModel = fromEnv || list[0] || FALLBACK_MODEL;
  // The default is always allowed, and comes first in the menu.
  const models = [defaultModel, ...list.filter((id) => id !== defaultModel)];
  return { models, defaultModel };
}

export type ModelResolution = { ok: true; model: string } | { ok: false; error: string };

/**
 * Picks the model for one request: the default when none was sent, the
 * requested one when it is on the allowlist, otherwise an error.
 */
export function resolveModel(requested: unknown, config: ModelConfig): ModelResolution {
  if (requested === undefined || requested === null || requested === "") {
    return { ok: true, model: config.defaultModel };
  }
  if (typeof requested !== "string") {
    return { ok: false, error: "model must be a string" };
  }
  if (!config.models.includes(requested)) {
    return { ok: false, error: `model "${requested.slice(0, 100)}" is not allowed` };
  }
  return { ok: true, model: requested };
}

/** A readable menu name: "kiro/claude-sonnet-4.5" -> "claude-sonnet-4.5". */
export function modelDisplayName(id: string): string {
  const slash = id.lastIndexOf("/");
  return slash >= 0 && slash < id.length - 1 ? id.slice(slash + 1) : id;
}

/** The provider prefix used as a menu group: "kiro/claude-sonnet-4.5" -> "kiro". */
export function modelGroup(id: string): string | undefined {
  const slash = id.indexOf("/");
  return slash > 0 ? id.slice(0, slash) : undefined;
}
