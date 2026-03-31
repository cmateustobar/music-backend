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
  origin: "*", // ⚠️ en producción puedes restringir
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Manejo explícito de preflight (importante para uploads)
app.options("*", cors());

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
   🔥 RUTAS
========================= */
app.use("/api/songs", songRoutes);

// Health check (clave para Render)
app.get("/", (req, res) => {
  res.send("🎵 API MusicApp funcionando");
});

/* =========================
   🔥 MANEJO GLOBAL DE ERRORES
========================= */
app.use((err, req, res, next) => {
  console.error("💥 ERROR GLOBAL:", err);
  res.status(500).json({
    msg: "Error interno del servidor",
    error: err.message,
  });
});

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
});