import { describe, expect, it } from "vitest";
import {
  FALLBACK_MODEL,
  getModelConfig,
  modelDisplayName,
  modelGroup,
  parseModelList,
  resolveModel,
} from "./models";

const ENV = {
  OPENAI_MODEL: "kiro/claude-sonnet-4.5",
  OPENAI_MODELS:
    "kiro/claude-sonnet-4.5, kiro/claude-haiku-4.5,auto/minimax-m3.1-flash,,group/auto-nemotron-3-ultra-550b-a55b-free",
};

describe("parseModelList", () => {
  it("trims, drops blanks and duplicates, keeps order", () => {
    expect(parseModelList(" a , b,,a , c ")).toEqual(["a", "b", "c"]);
  });
  it("returns [] for missing or empty input", () => {
    expect(parseModelList(undefined)).toEqual([]);
    expect(parseModelList("")).toEqual([]);
    expect(parseModelList(" , ")).toEqual([]);
  });
});

describe("getModelConfig", () => {
  it("uses OPENAI_MODELS as the allowlist with OPENAI_MODEL as default", () => {
    expect(getModelConfig(ENV)).toEqual({
      defaultModel: "kiro/claude-sonnet-4.5",
      models: [
        "kiro/claude-sonnet-4.5",
        "kiro/claude-haiku-4.5",
        "auto/minimax-m3.1-flash",
        "group/auto-nemotron-3-ultra-550b-a55b-free",
      ],
    });
  });
  it("defaults the list to just OPENAI_MODEL", () => {
    expect(getModelConfig({ OPENAI_MODEL: "kiro/claude-sonnet-4.5" })).toEqual({
      defaultModel: "kiro/claude-sonnet-4.5",
      models: ["kiro/claude-sonnet-4.5"],
    });
  });
  it("always allows the default and lists it first, even if missing from OPENAI_MODELS", () => {
    const cfg = getModelConfig({ OPENAI_MODEL: "x/default", OPENAI_MODELS: "a/one,x/default,b/two" });
    expect(cfg.models).toEqual(["x/default", "a/one", "b/two"]);
    expect(getModelConfig({ OPENAI_MODEL: "x/default", OPENAI_MODELS: "a/one" }).models).toEqual([
      "x/default",
      "a/one",
    ]);
  });
  it("uses the first listed model when OPENAI_MODEL is unset", () => {
    expect(getModelConfig({ OPENAI_MODELS: "a/one,b/two" }).defaultModel).toBe("a/one");
  });
  it("falls back when nothing is set", () => {
    expect(getModelConfig({})).toEqual({ defaultModel: FALLBACK_MODEL, models: [FALLBACK_MODEL] });
  });
});

describe("resolveModel", () => {
  const cfg = getModelConfig(ENV);
  it("uses the default when no model is sent", () => {
    for (const none of [undefined, null, ""]) {
      expect(resolveModel(none, cfg)).toEqual({ ok: true, model: "kiro/claude-sonnet-4.5" });
    }
  });
  it("accepts every allowlisted model", () => {
    for (const id of cfg.models) expect(resolveModel(id, cfg)).toEqual({ ok: true, model: id });
  });
  it("rejects models not on the allowlist", () => {
    for (const bad of ["gpt-5.2", "kiro/claude-opus-4", " kiro/claude-haiku-4.5", "KIRO/CLAUDE-SONNET-4.5"]) {
      expect(resolveModel(bad, cfg).ok).toBe(false);
    }
  });
  it("rejects non-string models", () => {
    for (const bad of [42, true, ["kiro/claude-haiku-4.5"], { id: "kiro/claude-haiku-4.5" }]) {
      expect(resolveModel(bad, cfg)).toEqual({ ok: false, error: "model must be a string" });
    }
  });
  it("truncates a long rejected id in the error", () => {
    const res = resolveModel("x".repeat(5000), cfg);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.length).toBeLessThan(200);
  });
});

describe("menu labels", () => {
  it("splits provider prefix and name", () => {
    expect(modelDisplayName("kiro/claude-haiku-4.5")).toBe("claude-haiku-4.5");
    expect(modelGroup("kiro/claude-haiku-4.5")).toBe("kiro");
    expect(modelDisplayName("gpt-5.2")).toBe("gpt-5.2");
    expect(modelGroup("gpt-5.2")).toBeUndefined();
  });
});
