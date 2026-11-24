import {
  generateSystemPrompt,
  type CloudPromptOptions,
  type LibrarySpec,
} from "@openuidev/lang-core";
import type { ToolDefinition } from "../tools/types";

const CONFIG_MARKER = "]]>openui:config\n";

/** What a dashboard call adds to the config block, as its `artifact` key. */
export interface ArtifactCall {
  /** The data tools its queries may call. */
  tools: ToolDefinition[];
  /** The artifact's title, on create. */
  title?: string;
  /** The artifact an edit changes. */
  id?: string;
}

/**
 * OpenUI Cloud's config block for an artifact: lang-core writes the library
 * part (`chatLibrary`, `systemPromptOptions`) and your instructions after it,
 * and each call adds its own under `artifact`: data tools, title and edit target.
 */
export function artifactConfig(
  library: LibrarySpec,
  promptOptions?: CloudPromptOptions,
  instructions?: string,
) {
  // Built once, so an invalid library fails when the dashboard is defined.
  const block = generateSystemPrompt({
    cloud: true,
    library,
    ...(promptOptions && { promptOptions }),
    ...(instructions && { instructions }),
  });
  if (!block.startsWith(CONFIG_MARKER)) {
    throw new Error("lang-core returned an unexpected config block");
  }
  // The config is one line of JSON; the instructions follow it as prose.
  const body = block.slice(CONFIG_MARKER.length);
  const end = body.indexOf("\n");
  const json = end === -1 ? body : body.slice(0, end);
  const prose = end === -1 ? "" : body.slice(end);
  const base = JSON.parse(json) as Record<string, unknown>;

  return (artifact: ArtifactCall): string =>
    CONFIG_MARKER + JSON.stringify({ ...base, artifact }) + prose;
}
