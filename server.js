import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import songRoutes from "./routes/songRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

/* =========================
   🔥 CORS DEFINITIVO (PRODUCCIÓN)
========================= */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors());

/* =========================
   🔥 MIDDLEWARES
========================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =========================
   🔥 LOGS DEBUG
========================= */
console.log("🌍 Entorno:", process.env.NODE_ENV || "development");
console.log("🔑 MONGO_URI:", process.env.MONGO_URI ? "OK" : "NO DEFINIDA");
console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "NO DEFINIDA");

/* =========================
   🔥 CONEXIÓN MONGO
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => {
    console.error("❌ Error Mongo:", err.message);
    process.exit(1);
  });

/* =========================
   🔥 RUTAS API
========================= */
app.use("/api/songs", songRoutes);
app.use("/api/auth", authRoutes);

/* =========================
   🔥 HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API MusicApp funcionando 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   🔥 ROOT
========================= */
app.get("/", (req, res) => {
  res.send("🎵 API MusicApp funcionando");
});

/* =========================
   🔥 404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ msg: "Ruta no encontrada" });
});

/* =========================
   🔥 ERROR GLOBAL
========================= */
app.use((err, req, res, next) => {
  console.error("💥 ERROR GLOBAL:", err);

  res.status(500).json({
    msg: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
});