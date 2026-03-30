import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";

import songRoutes from "./routes/songRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";

const app = express();

/* =========================
   🌐 CORS (SEGURO)
========================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("/*", cors());

/* =========================
   📡 LOGGER
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
    mongo: mongoose.connection.readyState,
    uptime: process.uptime(),
  });
});

/* =========================
   🚀 START (RESILIENTE)
========================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 🔥 EL SERVIDOR ARRANCA SIEMPRE
  app.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
  });

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no definida");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("🟢 Mongo conectado");

  } catch (error) {
    console.error("❌ Mongo falló:", error.message);
  }
};

startServer();