# `@openuidev/server`

Server utilities for OpenUI & OpenUI Gateway.

**Links:** [Package docs](https://openui.com/docs/api-reference/server) | [Autofix API](https://openui.com/docs/gateway/api/autofix) | [GitHub repo](https://github.com/thesysdev/openui)

## Autofix

Prefer this package over calling the endpoint yourself. Import `createAutofix` from `@openuidev/server/openai` for Chat Completions or `@openuidev/server/vercel` for the Vercel AI SDK. Use the spec from `openui generate --spec` for the same library as your renderer. Keep the API key on the server.

### Configure once

```ts
import { createAutofix } from "@openuidev/server/openai";
import library from "./openui.spec.json";

export const autofix = createAutofix({
  apiKey: process.env.THESYS_API_KEY!,
  library,
});
```

### Fix a completed generation

```ts
import { autofix } from "./lib/autofix";

const result = await autofix.completions.fix({ generation, messages, signal });

if (result.status === "fix_failed") {
  console.warn(result.unfixedErrors);
} else {
  // Render or persist result.content.
}
```

`generation` is the completed OpenUI text. Optional `messages` is the conversation before that generation.

### Wrap a Chat Completions stream

```ts
import OpenAI from "openai";
import { autofix } from "../../../lib/autofix";

const model = new OpenAI();

export async function POST(request: Request) {
  const { messages } = await request.json();
  const source = await model.chat.completions.create(
    { model: "gpt-5.5", messages, stream: true },
    { signal: request.signal },
  );

  return autofix.completions
    .stream({ stream: source, messages, signal: request.signal })
    .toResponse();
}
```

Return SSE for the frontend `openAIAdapter()`. `autofix.responses` is not supported yet.

### Wrap a Vercel AI SDK stream

```ts
import { streamText, toUIMessageStream } from "ai";
import { createAutofix } from "@openuidev/server/vercel";
import library from "./openui.spec.json";

const autofix = createAutofix({
  apiKey: process.env.THESYS_API_KEY!,
  library,
});

const result = streamText({
  model: "openai/gpt-5.5",
  system: systemPrompt, // Generated from the same OpenUI component library.
  prompt: "Show a greeting card",
  abortSignal: signal,
});

return autofix.ai
  .stream({
    stream: toUIMessageStream({ stream: result.stream }),
    signal,
  })
  .toResponse();
```

Pass `toUIMessageStream({ stream: result.stream })`. `toResponse()` is the UI message SSE protocol used by `useChat`.

### Consume the stream

Use either `chunks` or `toResponse()` once. `result` settles after that consumer finishes.

| Member         | Purpose                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `chunks`       | Native SDK events, including any correction.                             |
| `toResponse()` | SSE `Response` for the matching frontend.                                |
| `result`       | Settled Autofix result. Persist `content` when present, not joined text. |

`result` is `null` when Autofix did not run. A failed repair throws with `code: "fix_failed"`. Use `fix()` on the same helper when you already have completed text.

`apiBaseUrl` overrides the Gateway origin. `fetch` supports custom transports or mocks.

## Conversation history

Store each turn in an OpenUI Cloud conversation, and read the thread back for the next
request, in your SDK's messages. Use the API key on your server; pass `userId` to act as
that user, so a thread id from the browser 404s unless it's theirs.

```ts
import { OpenUIClient } from "@openuidev/server";

const openui = new OpenUIClient(); // reads THESYS_API_KEY

// The thread so far, oldest first, as Chat Completions messages.
const history = await openui.chat.conversations.items.list(threadId, { userId });

// Store only the new turn: earlier messages are already there.
await openui.chat.conversations.items.create(
  threadId,
  [
    { role: "user", content: lastUserText },
    { role: "assistant", content: assistantText },
  ],
  { userId },
);
```

`openui.langgraph.conversations` does the same with LangChain messages: `items.create`
takes `BaseMessage`s, and `items.list` returns `{ role, content }` messages that
`graph.invoke({ messages })` takes. Their conversation calls (`list`, `create`, `get`,
`update`, `delete`) are `openui.conversations`' own.

System and developer messages are skipped. A tool call is stored only together with its
result, so a turn stopped mid tool call leaves the thread valid for the next request.
Types come from the optional `openai` and `@langchain/core` peers: install the one you use.

`storeChatCompletionHistory` and `chatCompletionMessagesToItems` from
`@openuidev/server/openai`, and `storeLangGraphHistory` and `langGraphMessagesToItems`
from `@openuidev/server/langgraph`, are deprecated: they still work, as your org.
