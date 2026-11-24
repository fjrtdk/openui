import type { ExecutionContext } from "../tools/types";
import { createCloudApi, type CloudApi } from "./api";
import { createArtifacts } from "./artifacts";
import { chatMessagesToItems, itemsToChatMessages } from "./chat";
import { createConversations, withMessages } from "./conversations";
import { defineDashboard } from "./dashboard";
import { createFrontendToken } from "./frontend-token";
import { chatToLangGraphMessages, langGraphToChatMessages } from "./langgraph";
import {
  OpenUIApiError,
  type Artifacts,
  type ChatConversations,
  type Conversations,
  type CreateFrontendTokenParams,
  type Dashboard,
  type DashboardOptions,
  type FrontendToken,
  type LangGraphConversations,
  type OpenUIClientOptions,
  type RequestOptions,
} from "./types";

/**
 * One client for OpenUI Cloud on your server. Reads your API key from
 * `THESYS_API_KEY` unless you pass `apiKey`.
 */
export class OpenUIClient {
  private readonly api: CloudApi;

  /**
   * Your saved artifacts. Without `userId`, calls cover every user in your org;
   * with it, they act as that user.
   */
  readonly artifacts: Artifacts;

  /**
   * Your users' conversations and their items. Without `userId`, calls cover every user
   * in your org; with it, they act as that user.
   */
  readonly conversations: Conversations;

  /**
   * `conversations`, in Chat Completions messages: `items.create` takes them, and
   * `items.list` reads a whole thread back as them. Types come from `openai`.
   */
  readonly chat: { readonly conversations: ChatConversations };

  /**
   * `conversations`, in LangGraph's messages: `items.create` takes LangChain messages, and
   * `items.list` reads a whole thread back as messages `graph.invoke` takes. Types come
   * from `@langchain/core`.
   */
  readonly langgraph: { readonly conversations: LangGraphConversations };

  constructor(options: OpenUIClientOptions = {}) {
    if (
      options.appId !== undefined &&
      (typeof options.appId !== "string" || !options.appId.trim())
    ) {
      throw new OpenUIApiError("appId must be a non-empty string", "invalid_input");
    }
    this.api = createCloudApi(options);
    this.artifacts = createArtifacts(this.api);
    this.conversations = createConversations(this.api);
    this.chat = {
      conversations: withMessages(this.conversations, chatMessagesToItems, itemsToChatMessages),
    };
    this.langgraph = {
      conversations: withMessages(
        this.conversations,
        (messages) => chatMessagesToItems(langGraphToChatMessages(messages)),
        (items) => chatToLangGraphMessages(itemsToChatMessages(items)),
      ),
    };
  }

  /** Defines live dashboards from your library and data tools; its `interpreter` runs them. */
  defineDashboard<Context extends ExecutionContext = ExecutionContext>(
    options: DashboardOptions<Context>,
  ): Dashboard<Context> {
    return defineDashboard(this.api, options);
  }

  /** Mints the signed-in user's frontend token. Return it from your token endpoint as is. */
  createFrontendToken(
    params: CreateFrontendTokenParams,
    options?: RequestOptions,
  ): Promise<FrontendToken> {
    return createFrontendToken(this.api, params.userId, params.groupIds, options?.signal);
  }
}
