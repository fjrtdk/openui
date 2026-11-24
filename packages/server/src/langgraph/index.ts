import type { BaseMessage } from "@langchain/core/messages";
import { chatMessagesToItems } from "../client/chat.js";
import { langGraphToChatMessages } from "../client/langgraph.js";
import { storeChatCompletionHistory } from "../openai/store-conversation-items.js";
import type { StoreChatCompletionHistoryOptions } from "../openai/types.js";

export type StoreLangGraphHistoryOptions = Omit<StoreChatCompletionHistoryOptions, "messages"> & {
  /** Only completed messages from the new turn, never the full replay. */
  messages: readonly BaseMessage[];
};

/**
 * Convert a new LangGraph turn, including tool calls/results, into conversation items.
 *
 * @deprecated Use `openui.langgraph.conversations.items.create()`, which converts and stores.
 */
export function langGraphMessagesToItems(messages: readonly BaseMessage[]) {
  return chatMessagesToItems(langGraphToChatMessages(messages));
}

/**
 * Append a new turn to an existing conversation. Do not pass replayed history or chunks.
 *
 * @deprecated Use `openui.langgraph.conversations.items.create(conversationId, messages, { userId })`.
 */
export function storeLangGraphHistory(options: StoreLangGraphHistoryOptions) {
  return storeChatCompletionHistory({
    ...options,
    messages: langGraphToChatMessages(options.messages),
  });
}
