import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Domain and server modules under test never need a DOM.
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "out/**"],
  },
});
