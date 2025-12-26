const createApp = require("./app");

const app = createApp();
const port = parseInt(process.env.PORT || "5000", 10);

app.listen(port, () => {
  const apiPrefix = (process.env.API_PREFIX || "/api/v1").replace(/^\/+|\/+$/g, "");
  console.log(`Health: http://localhost:${port}/${apiPrefix}/health`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});
