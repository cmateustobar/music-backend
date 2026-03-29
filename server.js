import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import path from "path";
import songRoutes from "./routes/songRoutes.js";

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
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* =========================
   🎵 RUTAS API
========================= */
app.use("/api/songs", songRoutes);

/* =========================
   🎧 STREAMING PROFESIONAL
========================= */
app.get("/api/stream/:filename", (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "audio",
      filename
    );

    console.log("🎧 Streaming:", filename);

    if (!fs.existsSync(filePath)) {
      console.error("❌ No existe:", filePath);
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      // 📦 Enviar completo (fallback)
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/mpeg",
      });

      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // 🎯 STREAM PARCIAL (CLAVE PARA MÓVIL)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    // 🛡 VALIDACIÓN
    if (start >= fileSize || end >= fileSize) {
      return res.status(416).send("Requested range not satisfiable");
    }

    const chunkSize = end - start + 1;

    const stream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    });

    stream.pipe(res);

  } catch (error) {
    console.error("❌ Error streaming:", error);
    res.status(500).json({ message: "Error en streaming" });
  }
});

/* =========================
   🩺 HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/* =========================
   🔌 MONGODB (PRODUCCIÓN)
========================= */
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 MongoDB conectado (Atlas)"))
  .catch(err => {
    console.error("❌ Mongo error:", err);
    process.exit(1); // 🔥 importante en producción
  });

/* =========================
   🚀 SERVER START
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n🚀 SERVIDOR EN PRODUCCIÓN");
  console.log(`👉 Puerto: ${PORT}`);
  console.log(`👉 Health: /api/health`);
});