import { describe, it, expect } from "vitest";
import { addWorkingDays, formatDate } from "@/lib/utils";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("addWorkingDays", () => {
  it("should add 2 working days correctly", () => {
    // March 17, 2026 is Tuesday
    const tuesday = new Date("2026-03-17");
    const result = addWorkingDays(tuesday, 2);
    expect(formatDate(result)).toBe("2026-03-19"); // Thursday

    // March 14, 2026 is Saturday
    const saturday = new Date("2026-03-14");
    const result2 = addWorkingDays(saturday, 2);
    expect(formatDate(result2)).toBe("2026-03-17"); // Tuesday
  });
});
