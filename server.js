import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

import songRoutes from "./routes/songRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";

const app = express();

/* =========================
   🌐 CORS (PRODUCCIÓN READY)
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
   📁 ARCHIVOS ESTÁTICOS
========================= */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

/* =========================
   🎵 RUTAS API
========================= */
app.use("/api/songs", songRoutes);

/* =========================
   🎧 STREAMING (MODULAR)
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
   🚀 INICIO CONTROLADO
========================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no está definida");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("🟢 MongoDB conectado (Atlas)");

    app.listen(PORT, () => {
      console.log("\n🚀 SERVIDOR EN PRODUCCIÓN");
      console.log(`👉 Puerto: ${PORT}`);
      console.log(`👉 Health: /api/health`);
      console.log(`👉 Streaming: /api/stream/:filename`);
    });

  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
    // ⚠️ No cerramos proceso para evitar crash en Render
  }
};

startServer();