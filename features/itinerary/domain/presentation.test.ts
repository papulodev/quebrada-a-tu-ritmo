import { describe, expect, it } from "vitest";

import { filterUnscheduledReasons, formatDuration } from "./presentation";

describe("formatDuration", () => {
  it("formats minutes below one hour as minutes only", () => {
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(1)).toBe("1 min");
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats exact hours without remaining minutes", () => {
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(240)).toBe("4 h");
  });

  it("combines hours and remaining minutes", () => {
    expect(formatDuration(90)).toBe("1 h 30 min");
    expect(formatDuration(125)).toBe("2 h 5 min");
  });

  it("rejects negative or non-finite minutes", () => {
    expect(() => formatDuration(-1)).toThrow(RangeError);
    expect(() => formatDuration(Number.NaN)).toThrow(RangeError);
  });
});

describe("filterUnscheduledReasons", () => {
  it("keeps every warning when nothing is unscheduled", () => {
    expect(filterUnscheduledReasons(["A", "B"], [])).toEqual(["A", "B"]);
  });

  it("drops warnings that match an unscheduled reason", () => {
    expect(filterUnscheduledReasons(["A", "B"], [{ reason: "A" }])).toEqual([
      "B",
    ]);
  });

  it("keeps warnings that no unscheduled reason matches", () => {
    expect(filterUnscheduledReasons(["A", "C"], [{ reason: "B" }])).toEqual([
      "A",
      "C",
    ]);
  });

  it("drops every occurrence of a duplicated warning", () => {
    expect(filterUnscheduledReasons(["A", "A"], [{ reason: "A" }])).toEqual([]);
  });
});
