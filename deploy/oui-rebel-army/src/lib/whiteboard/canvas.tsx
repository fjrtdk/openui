"use client";
import "@excalidraw/excalidraw/index.css";

import { convertToExcalidrawElements, Excalidraw } from "@excalidraw/excalidraw";
import { useMemo } from "react";
import type { SkeletonElement } from "./skeleton";

/** The Excalidraw canvas itself; loaded lazily so the chat bundle stays small. */
export default function WhiteboardCanvas({
  skeletons,
  height,
}: {
  skeletons: SkeletonElement[];
  height: number;
}) {
  const initialData = useMemo(
    () => ({
      // The skeleton type mirrors Excalidraw's; cast at this one boundary.
      elements: convertToExcalidrawElements(
        skeletons as unknown as Parameters<typeof convertToExcalidrawElements>[0],
      ),
      appState: { viewBackgroundColor: "#ffffff" },
      scrollToContent: true,
    }),
    [skeletons],
  );
  return (
    <div style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <Excalidraw initialData={initialData} />
    </div>
  );
}
