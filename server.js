import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";

import songRoutes from "./routes/songRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";

const app = express();

/* =========================
   🌐 CORS (ROBUSTO)
========================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

/* =========================
   📡 LOGGER (DEBUG PRODUCCIÓN)
========================= */
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

/* =========================
   📦 MIDDLEWARES
========================= */
app.use(express.json());

/* =========================
   📁 ASEGURAR CARPETAS
========================= */
const uploadsPath = path.join(process.cwd(), "uploads");
const audioPath = path.join(uploadsPath, "audio");

if (!fs.existsSync(audioPath)) {
  console.log("📁 Creando uploads/audio...");
  fs.mkdirSync(audioPath, { recursive: true });
}

/* =========================
   📁 STATIC
========================= */
app.use("/uploads", express.static(uploadsPath));

/* =========================
   🎵 API
========================= */
app.use("/api/songs", songRoutes);
app.use("/api/stream", streamRoutes);

/* =========================
   🩺 HEALTH
========================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
});

/* =========================
   🚀 START
========================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("🟢 Mongo conectado");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor en puerto ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error iniciando:", error);
  }
};

startServer();