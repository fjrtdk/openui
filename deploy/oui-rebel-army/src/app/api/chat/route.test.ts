import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const stream = vi.fn(async () => new ReadableStream());
const getGraph = vi.fn((model: string) => {
  void model;
  return { stream };
});
vi.mock("@/agent", () => ({ getGraph }));

const { POST } = await import("./route");

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

describe("POST /api/chat model allowlist", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_MODEL", "kiro/claude-sonnet-4.5");
    vi.stubEnv("OPENAI_MODELS", "kiro/claude-sonnet-4.5,kiro/claude-haiku-4.5");
    getGraph.mockClear();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("uses the default model when none is sent", async () => {
    const res = await post({ messages: [] });
    expect(res.status).toBe(200);
    expect(getGraph).toHaveBeenCalledWith("kiro/claude-sonnet-4.5");
  });

  it("uses an allowlisted model", async () => {
    const res = await post({ messages: [], model: "kiro/claude-haiku-4.5" });
    expect(res.status).toBe(200);
    expect(getGraph).toHaveBeenCalledWith("kiro/claude-haiku-4.5");
  });

  it("rejects a model that is not allowlisted, without calling the provider", async () => {
    const res = await post({ messages: [], model: "openai/gpt-5.2" });
    expect(res.status).toBe(400);
    expect(getGraph).not.toHaveBeenCalled();
  });

  it("rejects a bad body", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post({ model: "kiro/claude-haiku-4.5" })).status).toBe(400);
    expect(getGraph).not.toHaveBeenCalled();
  });
});
