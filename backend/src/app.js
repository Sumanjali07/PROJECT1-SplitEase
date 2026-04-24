import express from "express";
import cors from "cors";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // ✅ CORS (ONLY ONCE)
  app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
  }));

  app.use(express.json());

  // ✅ health route
  app.get("/health", (req, res) => res.json({ ok: true }));

  // ✅ routes
  app.use("/api/groups", groupRoutes);
  app.use("/api/groups", expenseRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}