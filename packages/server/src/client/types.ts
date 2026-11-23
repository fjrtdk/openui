import type { CloudPromptOptions, LibrarySpec } from "@openuidev/lang-core";
import type { McpServers } from "../tools/mcp";
import type { DataTool, ExecutionContext, Interpreter } from "../tools/types";

export interface OpenUIClientOptions {
  /** Defaults to the `THESYS_API_KEY` environment variable. */
  apiKey?: string;
  /** OpenUI Cloud origin, without /v1. Defaults to https://api.thesys.dev. */
  baseUrl?: string;
  /**
   * Your app, when one API key serves several: users' frontend tokens and
   * artifacts belong to it, and generated scripts run only from it.
   */
  appId?: string;
  fetch?: typeof globalThis.fetch;
}

/**
 * The components an artifact can use, as a library spec: `library.toSpec()`, or
 * the JSON from `openui generate --spec`.
 */
export type ArtifactLibrary = LibrarySpec;

/** Extend the prompt built from your library: `examples`, `preamble`, `additionalRules`. */
export type ArtifactPromptOptions = CloudPromptOptions;

/** Your data tools, an MCP server's, or both. The dashboard's interpreter runs them. */
type DashboardDataTools<Context extends ExecutionContext> =
  | { tools: Record<string, DataTool<Context>>; mcp?: McpServers<Context> }
  | { tools?: Record<string, DataTool<Context>>; mcp: McpServers<Context> };

export type DashboardOptions<Context extends ExecutionContext = ExecutionContext> = {
  library: ArtifactLibrary;
  /** The model that builds and edits dashboards, as `provider/model`. */
  model: string;
  promptOptions?: ArtifactPromptOptions;
} & DashboardDataTools<Context>;

export interface CreateDashboardParams {
  /** A short title, such as "Q3 sales by region". */
  title: string;
  /** What to build. The subagent sees only this, so include any data it needs. */
  prompt: string;
}

export interface EditDashboardParams {
  id: string;
  /** The change to make, and any data it needs. */
  prompt: string;
}

export interface GetDashboardParams {
  id: string;
}

/** How to make a call, apart from what it asks for. */
export interface RequestOptions {
  /** Cancels the call while it waits for OpenUI Cloud. */
  signal?: AbortSignal;
}

/**
 * Creates and edits live dashboards. Each call resolves, as soon as the artifact has an id,
 * with the tool's response: return it from your tool as is, and pass it to the renderer.
 */
export interface Dashboard<Context extends ExecutionContext = ExecutionContext> {
  /**
   * `context` says who's asking, as for the interpreter: the dashboard belongs
   * to `context.userId`. Until they share it, only they can read, edit and run it.
   */
  create(
    params: CreateDashboardParams,
    context: Context,
    options?: RequestOptions,
  ): Promise<string>;
  /**
   * Edits in place, for its owner or anyone it's shared with for editing, through
   * `context.userId` or `context.groupIds`. Renderers keep the current version until the edit is ready.
   */
  edit(params: EditDashboardParams, context: Context, options?: RequestOptions): Promise<string>;
  /**
   * Reads a dashboard the user can open: their own, or one shared with them through
   * `context.userId` or `context.groupIds`. Give the model its `name` and `content`, or the
   * renderer its `id`.
   */
  get(
    params: GetDashboardParams,
    context: Context,
    options?: RequestOptions,
  ): Promise<CloudArtifact>;
  /** Runs this dashboard's data tools and generated scripts on your server. */
  readonly interpreter: Interpreter<Context>;
}

export interface CreateFrontendTokenParams {
  /** The signed-in user, from your session. The token reads their artifacts and those shared with them. */
  userId: string;
  /**
   * The groups the user is in, from your own system: artifacts shared with any of them are
   * readable too. Up to 10, each up to 64 characters. The token carries them until it expires,
   * so a change shows on the next token.
   */
  groupIds?: string[];
}

/** A user's frontend token, in the shape the browser's `createFrontendTokenManager` reads. */
export interface FrontendToken {
  /** `fct_…`, for the `x-thesys-frontend-token` header. */
  token: string;
  /** When it expires, in unix seconds. */
  expires_at: number;
}

/**
 * Who an artifact call is for. Without `userId` it's your org, which sees every
 * user's artifacts. With it, the call acts as that user and gets what their
 * frontend token would.
 */
export interface ArtifactRequestOptions extends RequestOptions {
  /** The user to act as, from your session. Never take it from the browser. */
  userId?: string;
  /**
   * That user's groups, as on their frontend token, so artifacts shared with
   * those groups count too. Only with `userId`. Up to 10, each up to 64 characters.
   */
  groupIds?: string[];
}

/** Pins belong to a user, so pinning needs one. */
export type ArtifactUserOptions = ArtifactRequestOptions & { userId: string };

/** Who an artifact is shared with: one user, or one of your groups. */
export interface ArtifactShareTarget {
  type: "user" | "group";
  id: string;
}

/** `view` opens and runs it; `edit` also edits, renames and shares it. */
export interface ShareArtifactParams extends ArtifactShareTarget {
  access: "view" | "edit";
}

/** One share on an artifact. */
export interface CloudArtifactShare extends ShareArtifactParams {
  /** Who shared it: a user id, or your org id for the API key alone. */
  createdBy: string;
  /** Unix milliseconds. */
  createdAt: number;
}

/** A saved artifact. Dashboards hold only their layout: scripts stay in OpenUI Cloud. */
export interface CloudArtifact {
  id: string;
  kind: "dashboard" | "slides" | "report";
  name?: string;
  /** The openui-lang program, ready for the renderer. */
  content: string;
  version?: string;
  /** Whether the user pinned it. Always false for your org, which has no pins. */
  pinned: boolean;
  /** Whether the user made it. Always false for your org. */
  isOwner: boolean;
  /** Whether the caller can edit, rename and share it. Always true for your org. */
  isEditable: boolean;
  /** Who it's shared with. Only when `isEditable`. */
  shares?: CloudArtifactShare[];
  conversationId?: string;
  /** The user it was made for. Absent when your org made it without one. */
  userId?: string;
  /** That user's app. */
  appId?: string;
  /** Unix milliseconds. */
  createdAt: number;
  /** Unix milliseconds. */
  updatedAt?: number;
}

/** One page of a list. */
export interface CloudList<Row> {
  data: Row[];
  hasMore: boolean;
  firstId?: string;
  /** Pass as `after` for the next page. */
  lastId?: string;
}

/** One page of artifacts, newest first unless you ask for `order: "asc"`. */
export type CloudArtifactList = CloudList<CloudArtifact>;

export interface ListArtifactsParams extends ArtifactRequestOptions {
  /** Only these kinds. */
  kind?: CloudArtifact["kind"] | CloudArtifact["kind"][];
  /** Case-insensitive match on the name. */
  name?: string;
  /** `true` for pinned artifacts only, `false` for unpinned ones. */
  pinned?: boolean;
  /** `true` for the user's own artifacts only, `false` for those shared with them. Needs `userId`. */
  isOwner?: boolean;
  /** Only the artifacts made in this conversation. */
  conversationId?: string;
  /** Page size, 1 to 100. */
  limit?: number;
  /** The page after this id: the last page's `lastId`. */
  after?: string;
  /** The page before this id: the last page's `firstId`. */
  before?: string;
  order?: "asc" | "desc";
}

export interface UpdateArtifactParams {
  /** The new name. */
  name?: string;
  /** The edited openui-lang program. Omit it to rename only. */
  content?: string;
}

/** Read and manage saved artifacts with the API key. */
export interface Artifacts {
  list(params?: ListArtifactsParams): Promise<CloudArtifactList>;
  get(id: string, options?: ArtifactRequestOptions): Promise<CloudArtifact>;
  update(
    id: string,
    params: UpdateArtifactParams,
    options?: ArtifactRequestOptions,
  ): Promise<CloudArtifact>;
  /** Deleted artifacts can't be restored. */
  delete(id: string, options?: ArtifactRequestOptions): Promise<void>;
  pin(id: string, options: ArtifactUserOptions): Promise<CloudArtifact>;
  unpin(id: string, options: ArtifactUserOptions): Promise<CloudArtifact>;
  /** Shares it, or changes the access of a target it's already shared with. */
  share(
    id: string,
    params: ShareArtifactParams,
    options?: ArtifactRequestOptions,
  ): Promise<CloudArtifact>;
  /** Removing a share that isn't there does nothing. */
  unshare(
    id: string,
    target: ArtifactShareTarget,
    options?: ArtifactRequestOptions,
  ): Promise<CloudArtifact>;
}

/**
 * Who a conversation call is for. Without `userId` it's your org, which sees every
 * user's conversations. With it, the call acts as that user and gets what their
 * frontend token would: their own conversations, in the client's app.
 */
export interface ConversationRequestOptions extends RequestOptions {
  /** The user to act as, from your session. Never take it from the browser. */
  userId?: string;
}

/** A conversation belongs to a user, so creating one needs one. */
export type ConversationUserOptions = ConversationRequestOptions & { userId: string };

/** Up to 16 pairs: keys up to 64 characters, values up to 512. */
export type ConversationMetadata = Record<string, string>;

/** A saved conversation. Its messages and tool calls are its items. */
export interface CloudConversation {
  id: string;
  title?: string;
  metadata?: ConversationMetadata;
  /** The user it belongs to. Absent when your org made it without one. */
  userId?: string;
  /** That user's app. */
  appId?: string;
  /** Unix milliseconds. */
  createdAt: number;
}

/** One page of conversations, newest first. */
export type CloudConversationList = CloudList<CloudConversation>;

export interface ListConversationsParams extends ConversationRequestOptions {
  /** Page size, 1 to 100. */
  limit?: number;
  /** The page after this id: the last page's `lastId`. */
  after?: string;
  /** The page before this id: the last page's `firstId`. */
  before?: string;
}

export interface CreateConversationParams {
  title?: string;
  metadata?: ConversationMetadata;
}

export type UpdateConversationParams = CreateConversationParams;

export type ConversationItemStatus =
  "in_progress" | "completed" | "incomplete" | "failed" | "searching" | "calling";

/**
 * A part of a message: `{ type: "input_text", text }` or `input_image` from the user,
 * `{ type: "output_text", text }` or `refusal` from the assistant.
 */
export interface ConversationContentPart {
  type: string;
  text?: string;
  [field: string]: unknown;
}

/** A message to add. System messages can't be stored: they're instructions, not history. */
export interface ConversationMessageInput {
  type: "message";
  role: "user" | "assistant";
  content: string | ConversationContentPart[];
  status?: ConversationItemStatus;
}

export interface ConversationFunctionCallInput {
  type: "function_call";
  call_id: string;
  name: string;
  /** JSON, as the model wrote it. */
  arguments: string;
  status?: ConversationItemStatus;
}

export interface ConversationFunctionCallOutputInput {
  type: "function_call_output";
  call_id: string;
  output: string;
  status?: ConversationItemStatus;
}

/**
 * An item to add, in OpenAI's Conversations API shape. `chatCompletionMessagesToItems()`
 * from `@openuidev/server/openai` makes them from Chat Completions messages, and an item
 * read back can be added as is. Other OpenAI item types, such as `reasoning`, are checked
 * by OpenUI Cloud.
 */
export type ConversationItemInput =
  | ConversationMessageInput
  | ConversationFunctionCallInput
  | ConversationFunctionCallOutputInput
  | { type?: string | null };

/** What every stored item has. OpenAI's shape: snake_case, `created_at` in unix seconds. */
interface ConversationItemBase {
  id: string;
  object: "conversation.item";
  conversation_id: string;
  /** Unix seconds. */
  created_at?: number;
  status?: ConversationItemStatus;
  metadata?: Record<string, unknown>;
}

export interface ConversationMessage extends ConversationItemBase {
  type: "message";
  role: "user" | "assistant" | "system";
  content: string | ConversationContentPart[];
}

export interface ConversationFunctionCall extends ConversationItemBase {
  type: "function_call";
  call_id: string;
  name: string;
  arguments: string;
}

export interface ConversationFunctionCallOutput extends ConversationItemBase {
  type: "function_call_output";
  call_id: string;
  name?: string;
  output?: unknown;
}

/** Items from OpenAI's hosted tools and reasoning. Their fields follow OpenAI's item types. */
export interface ConversationOtherItem extends ConversationItemBase {
  type:
    | "reasoning"
    | "web_search_call"
    | "image_search_call"
    | "knowledge_search_call"
    | "mcp_list_tools"
    | "mcp_approval_request"
    | "mcp_approval_response"
    | "mcp_call"
    | "artifact_call"
    | "unknown";
  [field: string]: unknown;
}

/** A stored item: narrow on `type`. */
export type ConversationItem =
  | ConversationMessage
  | ConversationFunctionCall
  | ConversationFunctionCallOutput
  | ConversationOtherItem;

/** One page of items, newest first unless you ask for `order: "asc"`. */
export type ConversationItemList = CloudList<ConversationItem>;

export interface ListConversationItemsParams extends ConversationRequestOptions {
  /** Page size, 1 to 100. */
  limit?: number;
  /** The page after this id: the last page's `lastId`. */
  after?: string;
  /** The page before this id: the last page's `firstId`. */
  before?: string;
  /** `"asc"` reads a thread from its start, to replay it to a model. */
  order?: "asc" | "desc";
}

/** Only an item's content and status change. */
export interface UpdateConversationItemParams {
  /** The new content, in the item's own shape: a message's string or parts. */
  content?: unknown;
  status?: ConversationItemStatus;
}

/** A conversation's messages and tool calls. */
export interface ConversationItems {
  list(id: string, params?: ListConversationItemsParams): Promise<ConversationItemList>;
  /**
   * Adds items in order and resolves with them as stored. Add only the new turn: earlier
   * items are already there. Up to 100 a call; none makes no call.
   */
  create(
    id: string,
    items: readonly ConversationItemInput[],
    options?: ConversationRequestOptions,
  ): Promise<ConversationItem[]>;
  get(id: string, itemId: string, options?: ConversationRequestOptions): Promise<ConversationItem>;
  update(
    id: string,
    itemId: string,
    params: UpdateConversationItemParams,
    options?: ConversationRequestOptions,
  ): Promise<ConversationItem>;
}

/** Read and manage conversations with the API key. */
export interface Conversations {
  list(params?: ListConversationsParams): Promise<CloudConversationList>;
  /** Creates it for `options.userId`, so their frontend token can read it too. */
  create(
    params: CreateConversationParams,
    options: ConversationUserOptions,
  ): Promise<CloudConversation>;
  get(id: string, options?: ConversationRequestOptions): Promise<CloudConversation>;
  update(
    id: string,
    params: UpdateConversationParams,
    options?: ConversationRequestOptions,
  ): Promise<CloudConversation>;
  /** Deleted conversations can't be restored. */
  delete(id: string, options?: ConversationRequestOptions): Promise<void>;
  readonly items: ConversationItems;
}

/** Failures from the OpenUI Cloud API expose a stable code and the HTTP status. */
export class OpenUIApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "OpenUIApiError";
  }
}
