import type { WhiteboardElement } from "./schema";

/**
 * Excalidraw "element skeleton" input (see convertToExcalidrawElements). Kept
 * as a plain type so this file has no Excalidraw import and stays testable.
 */
export interface SkeletonElement {
  type: WhiteboardElement["type"];
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  label?: { text: string };
  points?: [number, number][];
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: "solid";
}

export const MAX_WHITEBOARD_ELEMENTS = 300;
export const MAX_WHITEBOARD_TEXT = 500;

const clip = (t: string | undefined): string | undefined =>
  typeof t === "string" ? t.slice(0, MAX_WHITEBOARD_TEXT) : undefined;

const finite = (n: unknown, fallback: number): number =>
  typeof n === "number" && Number.isFinite(n) ? n : fallback;

/**
 * Maps the model's simple element list to Excalidraw skeletons. Bad numbers
 * fall back to safe defaults, and the list is capped so a runaway answer
 * cannot freeze the browser.
 */
export function toSkeletons(elements: readonly WhiteboardElement[] | undefined): SkeletonElement[] {
  if (!Array.isArray(elements)) return [];
  const out: SkeletonElement[] = [];
  for (const el of elements.slice(0, MAX_WHITEBOARD_ELEMENTS)) {
    if (!el || typeof el !== "object") continue;
    const text = clip(el.text);
    const x = finite(el.x, 0);
    const y = finite(el.y, 0);
    const colors = {
      ...(el.color ? { strokeColor: el.color } : {}),
      ...(el.fill ? { backgroundColor: el.fill, fillStyle: "solid" as const } : {}),
    };
    switch (el.type) {
      case "text":
        out.push({ type: "text", x, y, text: text ?? "", ...colors });
        break;
      case "arrow":
      case "line": {
        const dx = finite(el.x2, x + 100) - x;
        const dy = finite(el.y2, y) - y;
        out.push({
          type: el.type,
          x,
          y,
          points: [
            [0, 0],
            [dx, dy],
          ],
          ...(text ? { label: { text } } : {}),
          ...colors,
        });
        break;
      }
      case "rectangle":
      case "ellipse":
      case "diamond":
        out.push({
          type: el.type,
          x,
          y,
          width: Math.max(1, finite(el.width, 160)),
          height: Math.max(1, finite(el.height, 80)),
          ...(text ? { label: { text } } : {}),
          ...colors,
        });
        break;
      default:
        break;
    }
  }
  return out;
}
