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