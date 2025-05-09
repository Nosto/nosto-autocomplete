import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    {
      name: 'transform-templates',
      transform(code, id) {
        if (/\.(handlebars|mustache|liquid)$/.test(id)) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null,
          };
        }
      },
    }
  ],
  server: {
    port: 8080
  },
  test: {
    coverage: {
      include: ["src/**/*.{js,ts,tsx}"],
      skipFull: true,
      thresholds: {
        statements: 80,
        branches: 78, // TODO raise to 80
        lines: 80,
        functions: 80
      }
    },
    include: ["./spec/**/*.spec.{js,ts,tsx}"],
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