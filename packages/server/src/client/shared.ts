import { isIdList } from "../tools/types";
import type { CloudApi, CloudQuery } from "./api";
import { OpenUIApiError, type CloudList, type RequestOptions } from "./types";

export function invalidInput(message: string): never {
  throw new OpenUIApiError(message, "invalid_input");
}

export const invalidResponse = () =>
  new OpenUIApiError("Invalid OpenUI Cloud response", "invalid_response", 502);

/** Who a call is for: a user and their groups, or your org without `userId`. */
export interface ActAsOptions extends RequestOptions {
  userId?: string;
  groupIds?: string[];
}

/**
 * Acting as a user names them and their groups, in the client's app if it has one, as their
 * frontend token would. Without a user it's the org, which has no app or groups.
 */
export function actAs(api: CloudApi, { userId, groupIds }: ActAsOptions = {}): CloudQuery {
  if (userId === undefined) {
    if (groupIds !== undefined) invalidInput("groupIds needs userId: they're that user's groups");
    return {};
  }
  if (typeof userId !== "string" || !userId.trim()) {
    invalidInput("userId must be a non-empty string: take it from your authenticated session");
  }
  if (groupIds !== undefined && !isIdList(groupIds)) {
    invalidInput("groupIds must be an array of non-empty strings");
  }
  return {
    user_id: userId,
    ...(groupIds?.length && { group_ids: groupIds }),
    ...(api.appId !== undefined && { app_id: api.appId }),
  };
}

/** The query and signal of a call made as `options.userId`, or as your org. */
export const callAs = (api: CloudApi, options: ActAsOptions = {}) => ({
  query: actAs(api, options),
  signal: options.signal,
});

/** One page of a list, as OpenUI Cloud sends it, with each row mapped by `toRow`. */
export function toList<Row>(
  page: Record<string, unknown>,
  toRow: (row: unknown) => Row,
): CloudList<Row> {
  if (!Array.isArray(page["data"])) throw invalidResponse();
  return {
    data: page["data"].map((row) => toRow(row)),
    hasMore: page["has_more"] === true,
    ...(typeof page["first_id"] === "string" && { firstId: page["first_id"] }),
    ...(typeof page["last_id"] === "string" && { lastId: page["last_id"] }),
  };
}

/** `/v1/<collection>/<id><suffix>`, after checking the id. */
export function idPath(collection: string, id: unknown, suffix = ""): string {
  if (typeof id !== "string" || !id) invalidInput("id is required");
  return `/v1/${collection}/${encodeURIComponent(id)}${suffix}`;
}

/** A number as a query string value, left out when it's undefined. */
export const queryNumber = (value: number | undefined) =>
  value === undefined ? undefined : String(value);
