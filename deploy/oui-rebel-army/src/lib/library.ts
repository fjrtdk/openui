/**
 * The app's component library: OpenUI's Intelligent UI library (layout, text,
 * inputs, Chart, Grid, Table, Svg drawing, ...) extended with an Excalidraw
 * Whiteboard, plus prompt rules for dashboards and whiteboards.
 *
 * Also the entry point for `openui generate src/lib/library.ts --spec`, which
 * writes both exports to `src/generated/spec.json`.
 */
import type { PromptOptions } from "@openuidev/react-lang";
import {
  library as baseLibrary,
  promptOptions as basePromptOptions,
} from "@openuidev/intelligent-ui-library";
import { extraExamples, extraRules } from "./prompt-extras";
import { Whiteboard } from "./whiteboard";

export const library = baseLibrary.extend({ components: { add: [Whiteboard] } });

export const promptOptions: PromptOptions = {
  ...basePromptOptions,
  additionalRules: [...(basePromptOptions.additionalRules ?? []), ...extraRules],
  examples: [...(basePromptOptions.examples ?? []), ...extraExamples],
};
