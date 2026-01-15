import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;

// ✅ create app at top-level so Vercel can use it
const app = createApp();

// ✅ health route
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ✅ connect DB once (works for Vercel + local)
connectDB(process.env.MONGO_URI)
  .then(() => {
    // only listen locally
    if (process.env.VERCEL !== "1") {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Backend running on http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("❌ Server failed:", err);
  });

// ✅ Vercel will use exported app as handler
export default app;
