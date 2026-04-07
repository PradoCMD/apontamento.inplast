import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema.js";
import { authRouter } from "./routes/auth.js";
import { ordensRouter } from "./routes/ordens.js";
import { execucoesRouter } from "./routes/execucoes.js";
import { apontamentosRouter } from "./routes/apontamentos.js";
import { motivosRouter } from "./routes/motivos.js";
import { anexosRouter } from "./routes/anexos.js";
import { seedMotivos } from "./services/seed.js";

// Use process.cwd() instead of import.meta as it's safer for bundled CJS
const publicDir = path.resolve(process.cwd(), "dist", "public");
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");

const app = express();
const PORT = parseInt(process.env.PORT || "3000");

// Database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS for dev
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "inplast-aponta", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/ordens", ordensRouter);
app.use("/api/execucoes", execucoesRouter);
app.use("/api/apontamentos", apontamentosRouter);
app.use("/api/motivos", motivosRouter);
app.use("/api/anexos", anexosRouter);

// Serve uploads
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "./uploads")));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  console.log(`📦 Serving static files from: ${publicDir}`);
  app.use(express.static(publicDir));
  app.get("*", (req, res) => {
    // If it's an API route that doesn't exist, return 404
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

// Start
async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected");
    await seedMotivos();
    console.log("✅ Motivos seeded");
  } catch (err) {
    console.error("⚠️ Database connection failed, starting without DB:", err);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Inplast Aponta running on http://0.0.0.0:${PORT}`);
  });
}

start();
