import { getGraph } from "@/agent";
import { getModelConfig, resolveModel } from "@/lib/models";

export const runtime = "nodejs";

/** Caps that keep one anonymous request from exhausting memory or spend. */
export const MAX_BODY_BYTES = 4 * 1024 * 1024;
export const MAX_MESSAGES = 200;

/**
 * Runs the LangGraph agent in-process and returns its native `messages`-mode
 * SSE stream untransformed. The browser converts outgoing messages with
 * `langGraphMessageFormat` and parses the stream with `langGraphAdapter()`.
 * Nothing is stored server-side, so the full conversation history is sent as
 * graph input. The optional `model` must be on the OPENAI_MODELS allowlist.
 */
export async function POST(request: Request) {
  let body: { messages?: unknown; model?: unknown };
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return Response.json({ error: "request too large" }, { status: 413 });
    }
    body = JSON.parse(text) as typeof body;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body || !Array.isArray(body.messages)) {
    return Response.json({ error: "messages must be an array" }, { status: 400 });
  }
  if (body.messages.length > MAX_MESSAGES) {
    return Response.json({ error: "too many messages" }, { status: 413 });
  }
  if (!body.messages.every((m) => typeof m === "object" && m !== null && !Array.isArray(m))) {
    return Response.json({ error: "each message must be an object" }, { status: 400 });
  }

  const resolved = resolveModel(body.model, getModelConfig());
  if (!resolved.ok) {
    return Response.json({ error: resolved.error }, { status: 400 });
  }

  const messages = body.messages as { type: string; content: string }[];
  const stream = await getGraph(resolved.model).stream(
    { messages },
    { streamMode: "messages", encoding: "text/event-stream", signal: request.signal },
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
