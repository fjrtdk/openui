---
"@openuidev/server": minor
---

Add `openui.conversations` to manage conversations and their items with the API key: `list`, `create`, `get`, `update`, `delete`, and `items.list` / `create` / `get` / `update`. Pass `userId` to act as that user, as with `openui.artifacts`; `create` always needs one, so the user's frontend token can read the conversation.

`storeChatCompletionHistory` now stores through `openui.conversations.items.create`, so a failed write throws `OpenUIApiError` (with `code` and `status`) instead of a plain `Error`.
