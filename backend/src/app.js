import express from "express";
import cors from "cors";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // ✅ TEMP FIX (allow all origins)
  app.use(cors());

  app.use(express.json());

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/groups", groupRoutes);
  app.use("/api/groups", expenseRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}