"use client";

import { defineComponent } from "@openuidev/react-lang";
import { lazy, Suspense, useMemo } from "react";
import { WhiteboardSchema } from "./schema";
import { toSkeletons } from "./skeleton";

export * from "./schema";

const WhiteboardCanvas = lazy(() => import("./canvas"));

function WhiteboardView({
  elements,
  title,
  height,
}: {
  elements: Parameters<typeof toSkeletons>[0];
  title?: string;
  height?: number;
}) {
  // Recompute only when the content changes, not on every parent render, so
  // the canvas is not reset while the user draws.
  const signature = JSON.stringify(elements ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const skeletons = useMemo(() => toSkeletons(elements), [signature]);
  const h = Math.min(Math.max(typeof height === "number" ? height : 420, 200), 900);
  return (
    <div>
      {title ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div> : null}
      <Suspense fallback={<div style={{ height: h }}>Loading whiteboard…</div>}>
        <WhiteboardCanvas skeletons={skeletons} height={h} />
      </Suspense>
    </div>
  );
}

export const Whiteboard = defineComponent({
  name: "Whiteboard",
  props: WhiteboardSchema,
  description:
    "Editable whiteboard (Excalidraw) the user can draw on: boxes, ellipses, diamonds, text, arrows and lines placed by x/y. For diagrams, flowcharts, mind maps, architecture sketches and brainstorming boards.",
  component: ({ props }) => (
    <WhiteboardView elements={props.elements} title={props.title} height={props.height} />
  ),
});
