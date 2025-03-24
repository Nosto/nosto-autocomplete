import { defineConfig } from "vite"

export default defineConfig({
  test: {
    include: ["./spec/**/*.spec.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
    environmentOptions: {
      jsdom: {
        resources: "usable",
        runScripts: "dangerously"
      }
    },
    silent: true
  }
})