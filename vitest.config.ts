import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    {
      name: 'transform-mustache-liquid',
      transform(code, id) {
        if (/\.(mustache|liquid)$/.test(id)) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null,
          };
        }
      },
    }
  ],
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