import { afterEach, describe, expect, it } from "vitest";
import { databaseUrl, MissingEnvironmentVariableError } from "./env";

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

  it("treats a blank value as missing", () => {
    process.env.DATABASE_URL = "   ";

    expect(() => databaseUrl()).toThrow(/^DATABASE_URL is not set/);
  });

  it("points to .env.example instead of guessing a CLI command", () => {
    delete process.env.DATABASE_URL;

    expect(() => databaseUrl()).toThrow(/\.env\.example/);
  });

  it("uses a typed error that names the missing variable", () => {
    delete process.env.DATABASE_URL;

    expect(() => databaseUrl()).toThrow(MissingEnvironmentVariableError);
    try {
      databaseUrl();
    } catch (error) {
      expect((error as MissingEnvironmentVariableError).variable).toBe(
        "DATABASE_URL",
      );
    }
  });

  it("never includes other environment values in the error message", () => {
    const secret = "super-secret-token";
    process.env.SECRET_TOKEN = secret;
    delete process.env.DATABASE_URL;

    try {
      databaseUrl();
    } catch (error) {
      expect((error as Error).message).not.toContain(secret);
    } finally {
      delete process.env.SECRET_TOKEN;
    }
  });
});
