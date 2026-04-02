import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import songRoutes from "./routes/songRoutes.js";

dotenv.config();

const app = express();

/* =========================
   🔥 CORS CONFIGURADO PRO
========================= */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://music-backend-uoko.onrender.com",
    // 🔥 AGREGA AQUÍ TU FRONTEND CUANDO LO DESPLIEGUES EN VERCEL
    // "https://tu-app.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

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

/* =========================
   🔥 CONEXIÓN MONGO
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => {
    console.error("❌ Error Mongo:", err.message);
    process.exit(1);
  });

/* =========================
   🔥 RUTAS API
========================= */
app.use("/api/songs", songRoutes);

/* =========================
   🔥 HEALTH CHECK REAL (IMPORTANTE)
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
   🔥 ROOT (OPCIONAL)
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
   🔥 MANEJO GLOBAL DE ERRORES
========================= */
app.use((err, req, res, next) => {
  console.error("💥 ERROR GLOBAL:", err);

  res.status(500).json({
    msg: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
  });
});

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
});