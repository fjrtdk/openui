# oui-rebel-army

The OpenUI self-hosted chat that runs at oui.rebel.army, based on
[`templates/openui-self-hosted`](../../templates/openui-self-hosted) (LangGraph backend) with:

- **Model picker** in the chat header, fed by `OPENAI_MODELS`. The browser sends the chosen id in
  the `/api/chat` body and the server rejects (HTTP 400) any id not on the allowlist.
- **Intelligent UI library** (`@openuidev/intelligent-ui-library`): Grid, Card, Chart (bar, line,
  area, pie, donut, scatter), Table, Svg drawing and @functions, with extra prompt rules and an
  example for **dashboards** (filter, KPI cards, chart grid, table).
- **Whiteboard** component: an editable [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT)
  canvas the model fills with boxes, diamonds, text and arrows. Excalidraw is lazy-loaded, so it is
  not in the initial page bundle.

## Environment

| Variable          | Required | Example                                                                                                                      |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`  | yes      | (secret)                                                                                                                     |
| `OPENAI_BASE_URL` | no       | `http://127.0.0.1:3425/v1`                                                                                                   |
| `OPENAI_MODEL`    | no       | `kiro/claude-sonnet-4.5` (default model; always allowed; falls back to the first `OPENAI_MODELS` entry, then `gpt-5.2`)     |
| `OPENAI_MODELS`   | no       | `kiro/claude-sonnet-4.5,kiro/claude-haiku-4.5,auto/minimax-m3.1-flash,group/auto-nemotron-3-ultra-550b-a55b-free`            |

With `OPENAI_MODELS` unset the allowlist is just `OPENAI_MODEL` and the picker is hidden. The list
is read at request time, so changing it needs only a container restart, not a rebuild.

## Develop

```bash
npm ci
npm run generate   # writes src/generated/spec.json (library + prompt)
npm test           # vitest: model allowlist, chat route, whiteboard mapping, prompt examples
npm run lint && npm run typecheck && npm run build
```

## Docker

```bash
docker build -t openui-selfhosted:oui-0.2.0 .
docker run -d --name openui --network host --env-file /opt/openui/openui.env openui-selfhosted:oui-0.2.0
```

The container listens on `127.0.0.1:3460` (host network), like the previous image.
