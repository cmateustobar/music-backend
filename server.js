import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import songRoutes from "./routes/songRoutes.js";

dotenv.config();

const app = express();

// =============================
// 🔐 VALIDACIÓN ENV
// =============================
if (!process.env.MONGO_URI) {
  console.error("❌ Falta MONGO_URI en variables de entorno");
  process.exit(1);
}

// =============================
// 🌐 CORS (PRODUCCIÓN READY)
// =============================
app.use(
  cors({
    origin: "*", // luego puedes restringir a tu dominio Vercel
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);

// 👇 importante para preflight (POST upload)
app.options("*", cors());

// =============================
// 📦 MIDDLEWARES
// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// 🚀 ROUTES
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

// =============================
// ❤️ HEALTH CHECK
// =============================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API funcionando 🚀",
    time: new Date(),
  });
});

// =============================
// ❌ 404 HANDLER
// =============================
app.use((req, res) => {
  res.status(404).json({ msg: "Ruta no encontrada" });
});

// =============================
// ⚠️ ERROR HANDLER GLOBAL
// =============================
app.use((err, req, res, next) => {
  console.error("🔥 ERROR GLOBAL:", err.stack || err);
  res.status(err.status || 500).json({
    msg: err.message || "Error interno del servidor",
  });
});

// =============================
// 🗄️ DB CONNECTION
// =============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado ✅"))
  .catch((err) => {
    console.error("❌ Error MongoDB:", err);
    process.exit(1);
  });

// =============================
// 🖥️ SERVER
// =============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});