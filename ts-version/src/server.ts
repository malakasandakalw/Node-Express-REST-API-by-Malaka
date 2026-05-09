import app from "./app";
import config from "./config";
import connectDB from "./config/db";

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`
        🚀 Server running in ${config.nodeEnv} mode on port ${config.port}
  👤 Author  : Malaka Sandakal
  🔗 GitHub  : https://github.com/malakasandakalw
  🔗 LinkedIn: https://www.linkedin.com/in/malakasandakal/
  ❤️  API     : http://localhost:${config.port}/api/v1/health`);
  });

  // Graceful shutdown — finish ongoing requests before closing
  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Crash deliberately on unhandled rejections so process manager restarts
  process.on("unhandledRejection", (err: Error) => {
    console.error("UNHANDLED REJECTION:", err);
    server.close(() => process.exit(1));
  });
};

startServer();
