// src/server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import prisma from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;

    console.log("Connected to PostgreSQL via Prisma");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
