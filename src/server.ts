import express from "express";
import { config } from "./config";
import { secureCodeBoxWebhookRouter } from "./routes/secureCodeBoxWebhook";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(secureCodeBoxWebhookRouter);

const start = () => {
  app.listen(config.port, () => {
    console.log(`secure-code-bot listening on port ${config.port}`);
  });
};

if (require.main === module) {
  start();
}

export { app };
