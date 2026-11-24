import { createParser } from "@openuidev/lang-core";
import { describe, expect, it } from "vitest";
import spec from "../generated/spec.json";
import { exampleDashboard, exampleWhiteboard } from "./prompt-extras";

// The examples teach the model; they must parse cleanly against the generated
// library spec (run `npm run generate` after changing components).
describe("prompt examples", () => {
  const parser = createParser(spec.schema as never, spec.root);
  for (const [name, program] of Object.entries({ exampleDashboard, exampleWhiteboard })) {
    it(`${name} parses without errors`, () => {
      const result = parser.parse(program);
      expect(result.root).not.toBeNull();
      expect(result.meta.errors).toEqual([]);
      expect(result.meta.unresolved).toEqual([]);
      expect(result.meta.orphaned).toEqual([]);
    });
  }
  it("lists the Whiteboard and the extra examples in the spec", () => {
    expect(JSON.stringify(spec.components)).toContain("Whiteboard");
    expect(spec.promptOptions.examples.some((e: string) => e.includes("Whiteboard("))).toBe(true);
  });
});
