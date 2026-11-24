import { describe, expect, it } from "vitest";
import { MAX_WHITEBOARD_ELEMENTS, MAX_WHITEBOARD_TEXT, toSkeletons } from "./skeleton";

describe("toSkeletons", () => {
  it("maps shapes with labels and colors", () => {
    expect(
      toSkeletons([{ type: "rectangle", x: 10, y: 20, width: 100, height: 50, text: "A", fill: "#a5d8ff" }]),
    ).toEqual([
      {
        type: "rectangle",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: { text: "A" },
        backgroundColor: "#a5d8ff",
        fillStyle: "solid",
      },
    ]);
  });
  it("turns arrow end points into relative points", () => {
    const [a] = toSkeletons([{ type: "arrow", x: 100, y: 50, x2: 180, y2: 20 }]);
    expect(a!.points).toEqual([
      [0, 0],
      [80, -30],
    ]);
  });
  it("handles text, bad numbers and caps the list", () => {
    expect(toSkeletons([{ type: "text", x: 1, y: 2, text: "hi" }])).toEqual([
      { type: "text", x: 1, y: 2, text: "hi" },
    ]);
    const [r] = toSkeletons([{ type: "ellipse", x: Number.NaN, y: 0, width: -5 }]);
    expect(r).toMatchObject({ x: 0, width: 1, height: 80 });
    const many = Array.from({ length: 1000 }, () => ({ type: "text" as const, x: 0, y: 0 }));
    expect(toSkeletons(many)).toHaveLength(MAX_WHITEBOARD_ELEMENTS);
    expect(toSkeletons(undefined)).toEqual([]);
    const [long] = toSkeletons([{ type: "text", x: 0, y: 0, text: "x".repeat(10_000) }]);
    expect(long!.text).toHaveLength(MAX_WHITEBOARD_TEXT);
  });
});
