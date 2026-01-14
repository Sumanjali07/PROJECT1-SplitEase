import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGO_URI);

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Server failed:", err);
  process.exit(1);
});
