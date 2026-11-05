import { afterEach, describe, expect, it } from "vitest";
import { databaseUrl } from "./env";

describe("databaseUrl", () => {
  const original = process.env.DATABASE_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = original;
    }
  });

  it("returns the configured connection string", () => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/quebrada";

    expect(databaseUrl()).toBe("postgres://user:pass@localhost:5432/quebrada");
  });

  it("throws a descriptive error when the variable is missing", () => {
    delete process.env.DATABASE_URL;

    expect(() => databaseUrl()).toThrow(/^DATABASE_URL is not set/);
  });
});
