import { describe, it, expect } from "vitest";
import { getSystemPrompt } from "./utils";

describe("getSystemPrompt", () => {
  it("returns TECH prompt", () => {
    expect(getSystemPrompt("TECH")).toContain("technical consultant");
  });
  it("returns AUTO prompt", () => {
    expect(getSystemPrompt("AUTO")).toContain("automotive");
  });
});







