import { z } from "zod/v4";

/** One shape on the whiteboard. Coordinates are canvas px, origin top-left. */
export const WhiteboardElementSchema = z.object({
  type: z.enum(["rectangle", "ellipse", "diamond", "text", "arrow", "line"]),
  x: z.number(),
  y: z.number(),
  /** Box size for shapes; ignored for text. */
  width: z.number().optional(),
  height: z.number().optional(),
  /** Label inside a shape, or the text of a text element. */
  text: z.string().optional(),
  /** End point for arrow and line. */
  x2: z.number().optional(),
  y2: z.number().optional(),
  /** Stroke color, a CSS color like "#1e1e1e". */
  color: z.string().optional(),
  /** Fill color for shapes, a CSS color like "#a5d8ff". */
  fill: z.string().optional(),
});

export const WhiteboardSchema = z.object({
  elements: z.array(WhiteboardElementSchema),
  title: z.string().optional(),
  height: z.number().optional(),
});

export type WhiteboardElement = z.infer<typeof WhiteboardElementSchema>;
export type WhiteboardProps = z.infer<typeof WhiteboardSchema>;
