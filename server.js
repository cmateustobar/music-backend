import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";

import songRoutes from "./routes/songRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";

const app = express();

/* =========================
   🌐 CORS
========================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
}));

/* =========================
   📦 MIDDLEWARES
========================= */
app.use(express.json());

/* =========================
   📁 ASEGURAR CARPETAS (CRÍTICO EN RENDER)
========================= */
const uploadsPath = path.join(process.cwd(), "uploads");
const audioPath = path.join(uploadsPath, "audio");

if (!fs.existsSync(audioPath)) {
  console.log("📁 Creando carpeta uploads/audio...");
  fs.mkdirSync(audioPath, { recursive: true });
}

/* =========================
   📁 ARCHIVOS ESTÁTICOS
========================= */
app.use("/uploads", express.static(uploadsPath));

/* =========================
   🎵 RUTAS API
========================= */
app.use("/api/songs", songRoutes);

/* =========================
   🎧 STREAMING (PROTEGIDO)
========================= */
app.use("/api/stream", streamRoutes);

/* =========================
   🩺 HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

/* =========================
   🚀 INICIO SERVIDOR
========================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no está definida");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("🟢 MongoDB conectado");

    app.listen(PORT, () => {
      console.log("\n🚀 SERVIDOR ACTIVO");
      console.log(`👉 Puerto: ${PORT}`);
      console.log(`👉 Health: /api/health`);
      console.log(`👉 Stream: /api/stream/:filename`);
    });

  } catch (error) {
    console.error("❌ Error al iniciar:", error);
  }
};

startServer();