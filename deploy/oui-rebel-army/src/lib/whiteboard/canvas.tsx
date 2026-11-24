"use client";
import "@excalidraw/excalidraw/index.css";

import { convertToExcalidrawElements, Excalidraw } from "@excalidraw/excalidraw";
import { useEffect, useRef, useState } from "react";
import type { SkeletonElement } from "./skeleton";

type Api = Parameters<NonNullable<Parameters<typeof Excalidraw>[0]["excalidrawAPI"]>>[0];

const toElements = (skeletons: SkeletonElement[]) =>
  // The skeleton type mirrors Excalidraw's; cast at this one boundary.
  convertToExcalidrawElements(
    skeletons as unknown as Parameters<typeof convertToExcalidrawElements>[0],
  );

/**
 * The Excalidraw canvas itself; loaded lazily so the chat bundle stays small.
 * It mounts once. While an answer streams, new elements are pushed into the
 * scene instead of remounting; once the answer settles the user's edits stay.
 */
export default function WhiteboardCanvas({
  skeletons,
  height,
}: {
  skeletons: SkeletonElement[];
  height: number;
}) {
  const [api, setApi] = useState<Api | null>(null);
  const [initialData] = useState(() => ({
    elements: toElements(skeletons),
    appState: { viewBackgroundColor: "#ffffff" },
    scrollToContent: true,
  }));
  const first = useRef(true);

  useEffect(() => {
    if (!api) return;
    if (first.current) {
      first.current = false;
      return;
    }
    api.updateScene({ elements: toElements(skeletons) });
    api.scrollToContent();
  }, [api, skeletons]);

  return (
    <div style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <Excalidraw initialData={initialData} excalidrawAPI={setApi} />
    </div>
  );
}
