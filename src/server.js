const app = require("./app");
const { port, nodeEnv } = require("./config/env");

const server = app.listen(port, () => {
  console.log(`Server running in ${nodeEnv} mode at http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`\n${signal} received, shutting down.`);
    server.close(() => process.exit(0));
  });
}
