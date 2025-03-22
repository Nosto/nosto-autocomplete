export default {
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
}